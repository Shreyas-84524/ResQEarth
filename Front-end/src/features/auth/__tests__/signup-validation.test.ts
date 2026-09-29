import { signupSchema, normalizePhoneNumber } from "../schemas/signup-schema";
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

console.log("--- Starting Signup Validation & Logic Tests ---\n");

// 1. Valid Signup Data
const validPayload = {
  name: "Aditi Sharma",
  phone: "+91 98765 43210",
  email: "aditi.sharma@example.com",
  password: "SafePassword@2026",
  confirmPassword: "SafePassword@2026",
};
const validResult = signupSchema.safeParse(validPayload);
assert(validResult.success === true, "Valid signup payload succeeds");

// 2. Invalid Email
const invalidEmailPayload = {
  ...validPayload,
  email: "invalid-email-format",
};
const invalidEmailResult = signupSchema.safeParse(invalidEmailPayload);
assert(
  invalidEmailResult.success === false &&
    invalidEmailResult.error.issues.some((i) => i.path.includes("email")),
  "Invalid email format rejected"
);

// 3. Weak Password - Missing Uppercase
const noUpperPayload = {
  ...validPayload,
  password: "safepassword@2026",
  confirmPassword: "safepassword@2026",
};
assert(
  signupSchema.safeParse(noUpperPayload).success === false,
  "Weak password (no uppercase) rejected"
);

// 4. Weak Password - Missing Number
const noNumberPayload = {
  ...validPayload,
  password: "SafePassword@",
  confirmPassword: "SafePassword@",
};
assert(
  signupSchema.safeParse(noNumberPayload).success === false,
  "Weak password (no number) rejected"
);

// 5. Weak Password - Missing Special Character
const noSpecialPayload = {
  ...validPayload,
  password: "SafePassword2026",
  confirmPassword: "SafePassword2026",
};
assert(
  signupSchema.safeParse(noSpecialPayload).success === false,
  "Weak password (no special char) rejected"
);

// 6. Weak Password - Too Short
const shortPayload = {
  ...validPayload,
  password: "Sh1@rt",
  confirmPassword: "Sh1@rt",
};
assert(
  signupSchema.safeParse(shortPayload).success === false,
  "Weak password (less than 8 chars) rejected"
);

// 7. Mismatched Passwords
const mismatchPayload = {
  ...validPayload,
  password: "SafePassword@2026",
  confirmPassword: "DifferentPassword@2026",
};
const mismatchResult = signupSchema.safeParse(mismatchPayload);
assert(
  mismatchResult.success === false &&
    mismatchResult.error.issues.some((i) => i.path.includes("confirmPassword")),
  "Mismatched passwords rejected"
);

// 8. Missing Fields
const missingNamePayload = {
  ...validPayload,
  name: "",
};
assert(
  signupSchema.safeParse(missingNamePayload).success === false,
  "Missing/empty name rejected"
);

// 9. Invalid Phone Number
const invalidPhonePayload = {
  ...validPayload,
  phone: "12345",
};
assert(
  signupSchema.safeParse(invalidPhonePayload).success === false,
  "Short invalid phone number rejected"
);

const nonNumericPhonePayload = {
  ...validPayload,
  phone: "abcdefghij",
};
assert(
  signupSchema.safeParse(nonNumericPhonePayload).success === false,
  "Non-numeric phone number rejected"
);

// 10. Phone Number Normalization
assert(
  normalizePhoneNumber("9876543210") === "+919876543210",
  "Normalizes 10-digit number to +91XXXXXXXXXX"
);
assert(
  normalizePhoneNumber("+91 98765 43210") === "+919876543210",
  "Normalizes spaced +91 format"
);
assert(
  normalizePhoneNumber("09876543210") === "+919876543210",
  "Normalizes 0-prefixed 11-digit number"
);

// 11. Error Mapping
assert(
  mapFirebaseAuthErrorMessage({ code: "auth/email-already-in-use" }).includes(
    "already exists"
  ),
  "Maps auth/email-already-in-use to helpful message"
);
assert(
  mapFirebaseAuthErrorMessage({ code: "auth/weak-password" }).includes(
    "too weak"
  ),
  "Maps auth/weak-password to helpful message"
);
assert(
  mapFirebaseAuthErrorMessage({ code: "auth/invalid-email" }).includes(
    "not valid"
  ),
  "Maps auth/invalid-email to helpful message"
);

console.log(`\nResults: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
