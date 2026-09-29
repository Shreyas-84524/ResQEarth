import {
  hashToken,
  saveTokenRecord,
  revokeTokenRecord,
  cleanupInvalidTokens,
  getUserTokens,
  clearInMemoryTokenStore,
  getNotificationPermissionStatus,
  hasUserDeniedNotifications,
} from "../services/fcm-service";

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
  console.log("--- Starting FCM Notification Service Unit Tests ---\n");

  clearInMemoryTokenStore();

  // 1. hashToken deterministic hashing
  const tokenSample1 = "fcm_test_token_alpha_12345_67890";
  const hash1 = hashToken(tokenSample1);
  const hash2 = hashToken(tokenSample1);
  assert(hash1 === hash2, "hashToken is deterministic for identical tokens");
  assert(hash1.startsWith("token_fcmtest_"), "hashToken creates clean alphanumeric prefix");

  const tokenSample2 = "fcm_test_token_beta_99999_88888";
  const hashBeta = hashToken(tokenSample2);
  assert(hash1 !== hashBeta, "Distinct tokens produce distinct hashes");

  // 2. saveTokenRecord
  const testUid = "usr-test-fcm-1";
  const record = await saveTokenRecord(testUid, tokenSample1);
  assert(record.token === tokenSample1, "Token correctly recorded");
  assert(record.tokenHash === hash1, "Token hash matches generated hash");
  assert(record.status === "active", "Initial status is 'active'");
  assert(!!record.createdAt && !!record.lastSeenAt, "Timestamps are populated");

  const userTokens = await getUserTokens(testUid);
  assert(userTokens.length === 1, "getUserTokens retrieves stored token");
  assert(userTokens[0].tokenHash === hash1, "Retrieved token matches saved token");

  // 3. save a second token for same user
  await saveTokenRecord(testUid, tokenSample2);
  const updatedTokens = await getUserTokens(testUid);
  assert(updatedTokens.length === 2, "User can store multiple tokens (e.g., desktop and mobile)");

  // 4. revokeTokenRecord
  const revokeResult = await revokeTokenRecord(testUid, tokenSample1);
  assert(revokeResult === true, "revokeTokenRecord returns true");
  const postRevokeTokens = await getUserTokens(testUid);
  const revokedRecord = postRevokeTokens.find((t) => t.tokenHash === hash1);
  assert(revokedRecord?.status === "revoked", "Token status transitioned to 'revoked'");

  // 5. cleanupInvalidTokens
  const tokenSample3 = "fcm_test_token_gamma_33333";
  await saveTokenRecord(testUid, tokenSample3);
  const cleanedCount = await cleanupInvalidTokens(testUid, [tokenSample3]);
  assert(cleanedCount === 1, "cleanupInvalidTokens cleans 1 token");
  const postCleanupTokens = await getUserTokens(testUid);
  const invalidRecord = postCleanupTokens.find((t) => t.token === tokenSample3);
  assert(invalidRecord?.status === "invalid", "Token status set to 'invalid'");

  // 6. SSR & environment guards
  const permStatus = getNotificationPermissionStatus();
  assert(permStatus === "unsupported", "SSR environment returns 'unsupported' permission status without throwing");
  const hasDenied = hasUserDeniedNotifications();
  assert(typeof hasDenied === "boolean", "hasUserDeniedNotifications returns boolean in SSR");

  console.log(`\nFCM Service Validation Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
