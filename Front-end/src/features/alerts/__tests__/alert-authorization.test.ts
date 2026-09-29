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
  console.log("--- Starting Alert Authorization & Security Boundary Tests ---\n");
  clearAlertServiceStore();

  const adminUser: UserAuthContext = { uid: "admin_sec_1", role: "admin" };
  const citizenUser: UserAuthContext = { uid: "citizen_sec_1", role: "citizen" };

  // Setup: Admin creates 1 draft alert and 1 active alert
  const draftAlert = await createAlert(
    {
      title: "Admin Draft Plan: Coastal Evacuation",
      description: "Draft internal advisory for municipal disaster response team.",
      disasterType: "cyclone",
      severity: "CRITICAL",
      source: "Municipal Admin Desk",
      sourceType: "manual-admin",
      status: "draft",
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
    adminUser
  );

  const activeAlert = await createAlert(
    {
      title: "Active Public Cyclone Warning",
      description: "Coastal squalls reaching 80 km/h. Fishermen advised not to venture into sea.",
      disasterType: "cyclone",
      severity: "HIGH",
      source: "IMD",
      sourceType: "official",
      isOfficialAlert: true,
      status: "active",
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    },
    adminUser
  );

  // 1. Citizen cannot create alerts
  let citizenCreateBlocked = false;
  try {
    await createAlert(
      {
        title: "Unauthorized Citizen Warning",
        description: "Fake warning attempt.",
        disasterType: "flood",
        severity: "CRITICAL",
        source: "Citizen",
        sourceType: "manual-admin",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
      citizenUser
    );
  } catch (err: unknown) {
    citizenCreateBlocked = true;
    assert(
      err instanceof Error && err.message.includes("Unauthorized"),
      "Citizen alert creation is blocked with Unauthorized error"
    );
  }
  assert(citizenCreateBlocked, "Citizen cannot create alert");

  // 2. Unauthenticated (guest) cannot create alerts
  let guestCreateBlocked = false;
  try {
    await createAlert(
      {
        title: "Guest Alert",
        description: "Unauthenticated write attempt.",
        disasterType: "flood",
        severity: "HIGH",
        source: "Guest",
        sourceType: "manual-admin",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
      null
    );
  } catch {
    guestCreateBlocked = true;
  }
  assert(guestCreateBlocked, "Guest / unauthenticated alert creation is blocked");

  // 3. Citizen cannot update alerts
  let citizenUpdateBlocked = false;
  try {
    await updateAlert(activeAlert.id, { title: "Tampered Title" }, citizenUser);
  } catch (err: unknown) {
    citizenUpdateBlocked = true;
    assert(
      err instanceof Error && err.message.includes("Unauthorized"),
      "Citizen alert update is blocked with Unauthorized error"
    );
  }
  assert(citizenUpdateBlocked, "Citizen cannot update alert");

  // 4. Citizen cannot activate, expire, cancel, or supersede alerts
  let citizenActivateBlocked = false;
  try {
    await activateAlert(draftAlert.id, citizenUser);
  } catch {
    citizenActivateBlocked = true;
  }
  assert(citizenActivateBlocked, "Citizen cannot activate draft alerts");

  let citizenCancelBlocked = false;
  try {
    await cancelAlert(activeAlert.id, "Citizen cancel attempt", citizenUser);
  } catch {
    citizenCancelBlocked = true;
  }
  assert(citizenCancelBlocked, "Citizen cannot cancel alerts");

  let citizenExpireBlocked = false;
  try {
    await expireAlert(activeAlert.id, "Citizen expire attempt", citizenUser);
  } catch {
    citizenExpireBlocked = true;
  }
  assert(citizenExpireBlocked, "Citizen cannot expire alerts");

  let citizenSupersedeBlocked = false;
  try {
    await supersedeAlert(
      {
        oldAlertId: activeAlert.id,
        newAlertData: {
          title: "New Alert",
          description: "Desc",
          disasterType: "cyclone",
          severity: "HIGH",
          source: "IMD",
          sourceType: "official",
          isOfficialAlert: true,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      },
      citizenUser
    );
  } catch {
    citizenSupersedeBlocked = true;
  }
  assert(citizenSupersedeBlocked, "Citizen cannot supersede alerts");

  // 5. Citizen cannot view or record delivery attempts
  let citizenDeliveryBlocked = false;
  try {
    await recordDeliveryAttempt(
      {
        alertId: activeAlert.id,
        channel: "sms",
        targetRecipientCount: 50,
      },
      citizenUser
    );
  } catch {
    citizenDeliveryBlocked = true;
  }
  assert(citizenDeliveryBlocked, "Citizen cannot record delivery attempts");

  let citizenViewDeliveryBlocked = false;
  try {
    await getDeliveryAttempts(activeAlert.id, citizenUser);
  } catch {
    citizenViewDeliveryBlocked = true;
  }
  assert(citizenViewDeliveryBlocked, "Citizen cannot view delivery attempts");

  // 6. Citizen Read Scoping: Draft Isolation
  const citizenDraftFetch = await getAlertById(draftAlert.id, citizenUser);
  assert(citizenDraftFetch === null, "Citizen cannot retrieve draft alert by ID (returns null)");

  const guestDraftFetch = await getAlertById(draftAlert.id, null);
  assert(guestDraftFetch === null, "Guest cannot retrieve draft alert by ID (returns null)");

  const adminDraftFetch = await getAlertById(draftAlert.id, adminUser);
  assert(adminDraftFetch !== null && adminDraftFetch.id === draftAlert.id, "Admin CAN retrieve draft alert");

  // 7. Citizen Read Scoping: List queries exclude drafts
  const citizenAlertList = await getAlerts({}, citizenUser);
  assert(
    citizenAlertList.length === 1 && citizenAlertList[0].id === activeAlert.id,
    "Citizen alert query only returns active alerts, drafts are excluded"
  );

  const adminAlertList = await getAlerts({ status: ["draft", "active"] }, adminUser);
  assert(adminAlertList.length === 2, "Admin alert query includes all status values");

  // 8. Official Provenance Immutability Verification
  // Even if an admin updates an official alert, isOfficialAlert and sourceType remain locked
  const updatedOfficial = await updateAlert(
    activeAlert.id,
    {
      description: "Updated description for official alert with latest radar telemetry.",
    },
    adminUser
  );
  assert(updatedOfficial.isOfficialAlert === true, "isOfficialAlert remains true and immutable");
  assert(updatedOfficial.sourceType === "official", "sourceType remains official and immutable");
  assert(updatedOfficial.createdBy === activeAlert.createdBy, "createdBy remains immutable");
  assert(updatedOfficial.deduplicationKey === activeAlert.deduplicationKey, "deduplicationKey remains immutable");

  console.log(`\nAuthorization Validation Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
