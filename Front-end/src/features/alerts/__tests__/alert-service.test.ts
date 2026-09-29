import {
  createAlert,
  getAlertById,
  getAlerts,
  updateAlert,
  activateAlert,
  expireAlert,
  cancelAlert,
  supersedeAlert,
  recordDeliveryAttempt,
  getDeliveryAttempts,
  clearAlertServiceStore,
} from "../services/alert-service";
import type { UserAuthContext } from "../services/alert-service";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    failCount++;
  }
}

async function runTests() {
  console.log("--- Starting Alert Service & Repository Integration Tests ---\n");
  clearAlertServiceStore();

  const adminUser: UserAuthContext = { uid: "admin_001", role: "admin" };

  // 1. Admin creates a draft alert
  const draftAlert = await createAlert(
    {
      title: "Draft Flood Advisory for Navi Mumbai",
      description: "Monitoring water level in Panvel creek. Ground team stationed.",
      disasterType: "flood",
      severity: "GUARDED",
      source: "ResQEarth Operations",
      sourceType: "manual-admin",
      region: "Navi Mumbai",
      status: "draft",
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
    adminUser
  );

  assert(!!draftAlert.id, "Draft alert created with unique ID");
  assert(draftAlert.status === "draft", "Alert created in 'draft' status");
  assert(draftAlert.isOfficialAlert === false, "Manual alert isOfficialAlert is false");
  assert(draftAlert.deduplicationKey.includes("manual-admin"), "Deduplication key generated");

  // 2. Admin creates an active statutory official alert
  const officialAlert = await createAlert(
    {
      title: "IMD Heavy Rainfall & Thunderstorm Warning",
      description: "Very heavy rain accompanied by gusty winds expected across Mumbai and Thane.",
      disasterType: "severe-storm",
      severity: "HIGH",
      source: "IMD",
      sourceType: "official",
      isOfficialAlert: true,
      region: "Mumbai & Thane",
      status: "active",
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    },
    adminUser
  );

  assert(officialAlert.status === "active", "Official alert created with 'active' status");
  assert(officialAlert.isOfficialAlert === true, "Statutory alert has isOfficialAlert=true");

  // 3. getAlertById
  const fetched = await getAlertById(draftAlert.id, adminUser);
  assert(fetched !== null && fetched.id === draftAlert.id, "getAlertById returns draft alert for admin");

  // 4. updateAlert: update mutable fields and check immutability of core fields
  const updated = await updateAlert(
    draftAlert.id,
    {
      title: "Updated Flood Advisory: Heightened Water Level",
      severity: "MODERATE",
      instructions: ["Prepare flood barriers", "Avoid basement parking"],
    },
    adminUser
  );

  assert(updated.title === "Updated Flood Advisory: Heightened Water Level", "Title updated");
  assert(updated.severity === "MODERATE", "Severity updated");
  assert(updated.id === draftAlert.id, "Alert ID preserved (immutable)");
  assert(updated.createdAt === draftAlert.createdAt, "createdAt preserved (immutable)");
  assert(updated.sourceType === draftAlert.sourceType, "sourceType preserved (immutable)");
  assert(updated.isOfficialAlert === draftAlert.isOfficialAlert, "isOfficialAlert preserved (immutable)");

  // 5. activateAlert: draft -> active
  const activated = await activateAlert(draftAlert.id, adminUser);
  assert(activated.status === "active", "activateAlert transitions draft alert to active");

  // 6. getAlerts with filters
  const floodAlerts = await getAlerts({ disasterType: "flood" }, adminUser);
  assert(floodAlerts.length === 1 && floodAlerts[0].id === draftAlert.id, "getAlerts filters by disasterType");

  const highSeverityAlerts = await getAlerts({ severity: "HIGH" }, adminUser);
  assert(highSeverityAlerts.length === 1 && highSeverityAlerts[0].id === officialAlert.id, "getAlerts filters by severity");

  const officialOnlyAlerts = await getAlerts({ isOfficialOnly: true }, adminUser);
  assert(officialOnlyAlerts.length === 1 && officialOnlyAlerts[0].id === officialAlert.id, "getAlerts filters by officialOnly");

  const searchResults = await getAlerts({ searchQuery: "Panvel" }, adminUser);
  assert(searchResults.length === 1 && searchResults[0].id === draftAlert.id, "getAlerts search matches keyword in description");

  // 7. supersedeAlert: replace activated alert with upgraded emergency alert
  const supersedeResult = await supersedeAlert(
    {
      oldAlertId: activated.id,
      reason: "Water levels crossed danger mark; upgrading to Critical",
      newAlertData: {
        title: "CRITICAL: Panvel Creek Inundation Alert",
        description: "Immediate evacuation ordered for ground floor residences near Panvel creek.",
        disasterType: "flood",
        severity: "CRITICAL",
        source: "ResQEarth Operations",
        sourceType: "manual-admin",
        region: "Panvel, Navi Mumbai",
        expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        instructions: ["Move to designated municipal relief camps", "Dial 112 for rescue boats"],
      },
    },
    adminUser
  );

  assert(supersedeResult.supersededAlert.status === "superseded", "Old alert marked as 'superseded'");
  assert(supersedeResult.supersededAlert.supersededById === supersedeResult.newAlert.id, "Old alert has supersededById");
  assert(supersedeResult.newAlert.status === "active", "New replacement alert is 'active'");
  assert(supersedeResult.newAlert.supersedesAlertId === supersedeResult.supersededAlert.id, "New alert links back to supersedesAlertId");

  // 8. cancelAlert: cancel official alert with valid reason
  const cancelledAlert = await cancelAlert(
    officialAlert.id,
    "Squall line passed without extreme precipitation. Warning withdrawn by IMD.",
    adminUser
  );
  assert(cancelledAlert.status === "cancelled", "cancelAlert transitions alert to 'cancelled'");
  assert(
    Boolean(cancelledAlert.cancellationReason && cancelledAlert.cancellationReason.includes("withdrawn")),
    "Cancellation reason recorded"
  );

  // 9. expireAlert: manually expire an active alert
  const expirableAlert = await createAlert(
    {
      title: "Temporary Heatwave Advisory",
      description: "Afternoon peak temperature guidance.",
      disasterType: "heatwave",
      severity: "GUARDED",
      source: "ResQEarth Weather Desk",
      sourceType: "automatic",
      status: "active",
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    },
    adminUser
  );
  const expired = await expireAlert(expirableAlert.id, "Evening temperature normalized", adminUser);
  assert(expired.status === "expired", "expireAlert transitions alert to 'expired'");

  // 10. Delivery Attempt Tracking Foundation
  const attempt = await recordDeliveryAttempt(
    {
      alertId: supersedeResult.newAlert.id,
      channel: "in-site",
      targetRecipientCount: 1200,
      sentCount: 1200,
      failedCount: 0,
      status: "completed",
    },
    adminUser
  );

  assert(!!attempt.id, "Delivery attempt recorded with ID");
  assert(attempt.alertId === supersedeResult.newAlert.id, "Delivery attempt linked to alertId");
  assert(attempt.channel === "in-site", "Channel recorded as 'in-site'");
  assert(attempt.targetRecipientCount === 1200, "Target count recorded");

  const attemptsList = await getDeliveryAttempts(supersedeResult.newAlert.id, adminUser);
  assert(attemptsList.length === 1 && attemptsList[0].id === attempt.id, "getDeliveryAttempts retrieves logged attempt");

  console.log(`\nService Validation Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
