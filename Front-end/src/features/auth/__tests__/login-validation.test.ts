import { loginSchema } from "../schemas/login-schema";
import { mapFirebaseAuthErrorMessage } from "../services/auth-service";

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

console.log("--- Starting Login Validation & Auth Logic Tests ---\n");

// 1. Valid Login Data
const validLoginPayload = {
  email: "citizen@example.com",
  password: "SafePassword@2026",
  rememberMe: true,
};
const validResult = loginSchema.safeParse(validLoginPayload);
assert(validResult.success === true, "Valid login payload succeeds");
if (validResult.success) {
  assert(
    validResult.data.email === "citizen@example.com",
    "Email is lowercased and trimmed"
  );
}

// 2. Invalid Email Format
const invalidEmailPayload = {
  email: "not-an-email",
  password: "SafePassword@2026",
};
const invalidEmailResult = loginSchema.safeParse(invalidEmailPayload);
assert(
  invalidEmailResult.success === false &&
    invalidEmailResult.error.issues.some((i) => i.path.includes("email")),
  "Malformed email rejected"
);

// 3. Empty Email
const emptyEmailPayload = {
  email: "",
  password: "SafePassword@2026",
};
assert(
  loginSchema.safeParse(emptyEmailPayload).success === false,
  "Empty email rejected"
);

// 4. Empty Password
const emptyPasswordPayload = {
  email: "citizen@example.com",
  password: "",
};
assert(
  loginSchema.safeParse(emptyPasswordPayload).success === false,
  "Empty password rejected"
);

// 5. Login Error Mapping - auth/invalid-credential
const invalidCredMsg = mapFirebaseAuthErrorMessage({
  code: "auth/invalid-credential",
});
assert(
  invalidCredMsg.includes("Invalid email or password"),
  "Maps auth/invalid-credential"
);

// 6. Login Error Mapping - auth/user-not-found
const userNotFoundMsg = mapFirebaseAuthErrorMessage({
  code: "auth/user-not-found",
});
assert(
  userNotFoundMsg.includes("No account found"),
  "Maps auth/user-not-found"
);

// 7. Login Error Mapping - auth/wrong-password
const wrongPasswordMsg = mapFirebaseAuthErrorMessage({
  code: "auth/wrong-password",
});
assert(
  wrongPasswordMsg.includes("Incorrect password"),
  "Maps auth/wrong-password"
);

// 8. Login Error Mapping - auth/user-disabled
const userDisabledMsg = mapFirebaseAuthErrorMessage({
  code: "auth/user-disabled",
});
assert(
  userDisabledMsg.includes("disabled"),
  "Maps auth/user-disabled"
);

// 9. Login Error Mapping - auth/too-many-requests
const tooManyRequestsMsg = mapFirebaseAuthErrorMessage({
  code: "auth/too-many-requests",
});
assert(
  tooManyRequestsMsg.includes("temporarily disabled"),
  "Maps auth/too-many-requests"
);

// 10. Login Error Mapping - auth/network-request-failed
const networkMsg = mapFirebaseAuthErrorMessage({
  code: "auth/network-request-failed",
});
assert(
  networkMsg.includes("Network connection failed"),
  "Maps auth/network-request-failed"
);

console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
