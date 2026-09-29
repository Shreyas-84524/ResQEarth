import {
  createAlertSchema,
  updateAlertSchema,
  cancelAlertSchema,
  supersedeAlertSchema,
  recordDeliveryAttemptSchema,
  createAuditLogSchema,
} from "../schemas";

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

console.log("--- Starting Alert Zod Schema & Provenance Invariant Tests ---\n");

// 1. Valid Alert Creation - Manual Admin
const validAdminAlert = {
  title: "Flash Flood Warning for Mithi River Catchment",
  description: "Severe waterlogging anticipated in Kurla and Sion low-lying corridors. Citizens are advised to stay indoors.",
  disasterType: "flood",
  severity: "HIGH",
  source: "ResQEarth Mumbai Operations",
  sourceType: "manual-admin",
  region: "Mumbai Suburban",
  latitude: 19.076,
  longitude: 72.8777,
  radiusKm: 15,
  targetMode: "radius",
  instructions: ["Avoid underpasses", "Keep emergency kit ready", "Tune to disaster helpline 112"],
  expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
  status: "draft",
};
const res1 = createAlertSchema.safeParse(validAdminAlert);
assert(res1.success === true, "Valid manual admin alert payload parses successfully");

// 2. Valid Official Alert
const validOfficialAlert = {
  title: "IMD Red Alert: Cyclone Warning",
  description: "Extremely severe cyclonic storm approaching Konkan coastline.",
  disasterType: "cyclone",
  severity: "CRITICAL",
  source: "IMD",
  sourceType: "official",
  isOfficialAlert: true,
  region: "Maharashtra Coast",
  targetMode: "region",
  expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
  status: "active",
};
const res2 = createAlertSchema.safeParse(validOfficialAlert);
assert(res2.success === true, "Valid official alert with isOfficialAlert=true succeeds");

// 3. Official Source Invariant: sourceType='official' with isOfficialAlert=false REJECTED
const invalidOfficialAlert = {
  ...validOfficialAlert,
  isOfficialAlert: false,
};
const res3 = createAlertSchema.safeParse(invalidOfficialAlert);
assert(
  res3.success === false && res3.error.issues.some((i) => i.path.includes("isOfficialAlert")),
  "Statutory official alert with isOfficialAlert=false is rejected"
);

// 4. Fake Official Invariant: sourceType='manual-admin' with isOfficialAlert=true REJECTED
const fakeOfficialAlert = {
  ...validAdminAlert,
  isOfficialAlert: true,
};
const res4 = createAlertSchema.safeParse(fakeOfficialAlert);
assert(
  res4.success === false && res4.error.issues.some((i) => i.path.includes("isOfficialAlert")),
  "Manual admin alert claiming isOfficialAlert=true is strictly rejected"
);

// 5. Invalid Source Type
const invalidSourceTypeAlert = {
  ...validAdminAlert,
  sourceType: "unverified-social-media",
};
const res5 = createAlertSchema.safeParse(invalidSourceTypeAlert);
assert(
  res5.success === false && res5.error.issues.some((i) => i.path.includes("sourceType")),
  "Invalid source type rejected"
);

// 6. Malformed Alert: Title too short
const shortTitleAlert = {
  ...validAdminAlert,
  title: "Hi",
};
const res6 = createAlertSchema.safeParse(shortTitleAlert);
assert(
  res6.success === false && res6.error.issues.some((i) => i.path.includes("title")),
  "Short title (<3 chars) rejected"
);

// 7. Malformed Alert: Invalid coordinates
const badCoordsAlert = {
  ...validAdminAlert,
  latitude: 105.0, // out of range
};
const res7 = createAlertSchema.safeParse(badCoordsAlert);
assert(
  res7.success === false && res7.error.issues.some((i) => i.path.includes("latitude")),
  "Latitude > 90 rejected"
);

// 8. Radius TargetMode without coordinates REJECTED
const radiusWithoutCoords = {
  ...validAdminAlert,
  latitude: undefined,
  longitude: undefined,
  targetMode: "radius",
};
const res8 = createAlertSchema.safeParse(radiusWithoutCoords);
assert(
  res8.success === false && res8.error.issues.some((i) => i.path.includes("targetMode")),
  "Target mode 'radius' without lat/lon coordinates is rejected"
);

// 9. Update Alert Schema: Valid Mutable Fields
const validUpdate = {
  title: "Updated Flash Flood Warning: Level 2",
  severity: "CRITICAL",
  instructions: ["Immediate evacuation of ground floors"],
};
const res9 = updateAlertSchema.safeParse(validUpdate);
assert(res9.success === true, "Valid update payload parses successfully");

// 10. Update Alert Schema: Strictly rejects extra/immutable fields (strict mode)
const invalidUpdateExtra = {
  ...validUpdate,
  id: "attempt-to-overwrite-id",
};
const res10 = updateAlertSchema.safeParse(invalidUpdateExtra);
assert(res10.success === false, "Attempt to inject immutable 'id' in update schema is rejected");

// 11. Cancel Alert Schema
const validCancel = {
  alertId: "alt_12345",
  reason: "Weather radar shows rain cell has dissipated safely.",
};
const res11 = cancelAlertSchema.safeParse(validCancel);
assert(res11.success === true, "Valid cancellation schema parses successfully");

const shortReasonCancel = {
  alertId: "alt_12345",
  reason: "No",
};
const res12 = cancelAlertSchema.safeParse(shortReasonCancel);
assert(res12.success === false, "Short cancellation reason (<3 chars) is rejected");

// 12. Supersede Alert Schema
const validSupersede = {
  oldAlertId: "alt_12345",
  reason: "Upgrading from Guarded to Critical due to dam release",
  newAlertData: validOfficialAlert,
};
const res13 = supersedeAlertSchema.safeParse(validSupersede);
assert(res13.success === true, "Valid supersede schema parses successfully");

// 13. Delivery Attempt Schema
const validDeliveryAttempt = {
  alertId: "alt_12345",
  channel: "sms",
  targetRecipientCount: 250,
  sentCount: 245,
  failedCount: 5,
  status: "completed",
};
const res14 = recordDeliveryAttemptSchema.safeParse(validDeliveryAttempt);
assert(res14.success === true, "Valid delivery attempt schema parses successfully");

// 14. Audit Log Schema
const validAuditLog = {
  actorUid: "admin_uid_99",
  actorRole: "admin",
  action: "alert.activated",
  resource: "alerts",
  resourceId: "alt_12345",
  outcome: "success",
  details: { previousStatus: "draft", nextStatus: "active" },
};
const res15 = createAuditLogSchema.safeParse(validAuditLog);
assert(res15.success === true, "Valid audit log schema parses successfully");

console.log(`\nSchema Validation Results: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
