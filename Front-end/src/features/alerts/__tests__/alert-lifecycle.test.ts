import {
  validateStatusTransition,
  isAlertActive,
  isAlertExpired,
  computeEffectiveStatus,
  deriveDefaultExpiration,
} from "../services/alert-lifecycle";

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

console.log("--- Starting Alert Lifecycle & State Transition Tests ---\n");

// 1. Allowed Transitions from 'draft'
assert(validateStatusTransition("draft", "active").allowed === true, "draft -> active is allowed");
assert(validateStatusTransition("draft", "cancelled").allowed === true, "draft -> cancelled is allowed");
assert(validateStatusTransition("draft", "expired").allowed === false, "draft -> expired is rejected");
assert(validateStatusTransition("draft", "superseded").allowed === false, "draft -> superseded is rejected");

// 2. Allowed Transitions from 'active'
assert(validateStatusTransition("active", "expired").allowed === true, "active -> expired is allowed");
assert(validateStatusTransition("active", "cancelled").allowed === true, "active -> cancelled is allowed");
assert(validateStatusTransition("active", "superseded").allowed === true, "active -> superseded is allowed");
assert(validateStatusTransition("active", "draft").allowed === false, "active -> draft is rejected");

// 3. Terminal State Invariants: 'expired', 'cancelled', 'superseded' cannot transition
assert(validateStatusTransition("expired", "active").allowed === false, "expired -> active is rejected");
assert(validateStatusTransition("expired", "draft").allowed === false, "expired -> draft is rejected");
assert(validateStatusTransition("cancelled", "active").allowed === false, "cancelled -> active is rejected");
assert(validateStatusTransition("superseded", "active").allowed === false, "superseded -> active is rejected");

// 4. Idempotent self-transition
assert(validateStatusTransition("active", "active").allowed === true, "active -> active no-op allowed");

// 5. isAlertActive helper tests
const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();

assert(isAlertActive({ status: "active", expiresAt: futureDate }) === true, "Active alert with future expiry is active");
assert(isAlertActive({ status: "active", expiresAt: pastDate }) === false, "Active alert with past expiry is not active");
assert(isAlertActive({ status: "draft", expiresAt: futureDate }) === false, "Draft alert with future expiry is not active");
assert(isAlertActive({ status: "expired", expiresAt: futureDate }) === false, "Expired alert status is not active");

// 6. isAlertExpired helper tests
assert(isAlertExpired({ status: "expired", expiresAt: futureDate }) === true, "Alert with status='expired' is expired");
assert(isAlertExpired({ status: "active", expiresAt: pastDate }) === true, "Active alert past expiration date is expired");
assert(isAlertExpired({ status: "active", expiresAt: futureDate }) === false, "Active alert before expiration date is not expired");

// 7. computeEffectiveStatus helper tests
assert(
  computeEffectiveStatus({ status: "active", expiresAt: pastDate }) === "expired",
  "Effective status of time-expired active alert is computed as 'expired'"
);
assert(
  computeEffectiveStatus({ status: "active", expiresAt: futureDate }) === "active",
  "Effective status of unexpired active alert is 'active'"
);
assert(
  computeEffectiveStatus({ status: "draft", expiresAt: pastDate }) === "draft",
  "Draft alert remains 'draft' regardless of time"
);

// 8. deriveDefaultExpiration tests
const base = new Date("2026-09-30T00:00:00.000Z");
const criticalExp = new Date(deriveDefaultExpiration("CRITICAL", base));
assert(
  criticalExp.getTime() - base.getTime() === 4 * 3600 * 1000,
  "CRITICAL severity defaults to 4-hour expiration window"
);

const lowExp = new Date(deriveDefaultExpiration("LOW", base));
assert(
  lowExp.getTime() - base.getTime() === 48 * 3600 * 1000,
  "LOW severity defaults to 48-hour expiration window"
);

console.log(`\nLifecycle Validation Results: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
