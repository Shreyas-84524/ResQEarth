import {
  sendSingleSms,
  sendBulkSms,
  getSmsDeliveryLogs,
  clearSmsDeliveryLogs,
} from "../gateway-client";
import { sanitizeE164Phone, maskPhoneNumber, hashPhoneNumber } from "../phone-utils";

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
  console.log("--- Starting SMS Gateway Client Unit Tests ---\n");

  clearSmsDeliveryLogs();

  // 1. Phone sanitization
  const indian10 = sanitizeE164Phone("9876543210");
  assert(indian10.valid === true && indian10.formatted === "+919876543210", "10-digit Indian phone normalized to +91");

  const formattedWithDashes = sanitizeE164Phone("+91 98765-43210");
  assert(formattedWithDashes.valid === true && formattedWithDashes.formatted === "+919876543210", "Dashes and spaces stripped cleanly");

  const invalidLetters = sanitizeE164Phone("98765ABCD0");
  assert(invalidLetters.valid === false, "Letters in phone number rejected");

  // 2. Phone masking & hashing
  const masked = maskPhoneNumber("+919876543210");
  assert(masked === "+91 ****** 3210", "Phone correctly masked for privacy");

  const hash1 = hashPhoneNumber("+919876543210");
  const hash2 = hashPhoneNumber("+919876543210");
  assert(hash1 === hash2, "Phone hashing is deterministic");

  // 3. Send single SMS in mock/simulated mode
  const resSuccess = await sendSingleSms(
    {
      phoneNumber: "+919876543210",
      message: "ResQEarth Test Warning Alert",
      alertId: "alert-12345",
      userId: "user-test-1",
      hasConsent: true,
    },
    { mockMode: true }
  );

  assert(resSuccess.success === true, "Mock mode sends SMS successfully");
  assert(resSuccess.status === "simulated", "Status is 'simulated'");
  assert(resSuccess.maskedPhone === "+91 ****** 3210", "Response contains masked phone");

  const logs = getSmsDeliveryLogs("alert-12345");
  assert(logs.length === 1, "Delivery attempt logged in delivery logs store");
  assert(logs[0].status === "delivered", "Log status is 'delivered'");
  assert(logs[0].maskedPhone === "+91 ****** 3210", "Log stores only masked phone");

  // 4. SMS Consent Rejection
  const resNoConsent = await sendSingleSms(
    {
      phoneNumber: "+919876543210",
      message: "ResQEarth Test Warning Alert",
      alertId: "alert-12345",
      userId: "user-test-2",
      hasConsent: false, // User denied SMS consent
    },
    { mockMode: true }
  );

  assert(resNoConsent.success === false, "Rejects dispatch when hasConsent is false");
  assert(resNoConsent.error?.includes("consented") === true, "Error message states consent requirement");

  // 5. Invalid Phone rejection
  const resInvalid = await sendSingleSms(
    {
      phoneNumber: "not-a-number",
      message: "Test message",
      alertId: "alert-12345",
      hasConsent: true,
    },
    { mockMode: true }
  );
  assert(resInvalid.success === false, "Rejects dispatch for invalid phone number");

  // 6. Bulk SMS dispatch
  const bulkRes = await sendBulkSms(
    [
      { phoneNumber: "+919876543210", message: "Bulk 1", hasConsent: true },
      { phoneNumber: "+919876543211", message: "Bulk 2", hasConsent: true },
    ],
    { mockMode: true }
  );

  assert(bulkRes.length === 2, "Bulk SMS dispatches all items");
  assert(bulkRes.every((r) => r.success), "All bulk dispatches succeeded");

  console.log(`\nSMS Gateway Validation Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
