import {
  getStoredCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  acceptEssentialOnly,
} from "../services/cookie-consent-service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Cookie Consent & Privacy Service Tests (Sub-Phase 4.8) ---");

// Mock window and localStorage for node environment
const storageMock: Record<string, string> = {};
global.window = {} as unknown as Window & typeof globalThis;
global.localStorage = {
  getItem: (key: string) => storageMock[key] || null,
  setItem: (key: string, value: string) => {
    storageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMock[key];
  },
  clear: () => {
    for (const k in storageMock) delete storageMock[k];
  },
  length: 0,
  key: () => null,
};

// 1. Initial default state
const initial = getStoredCookiePreferences();
assert(initial.essential === true, "Essential cookies must always be true");
assert(initial.functional === true, "Functional cookies default to true");
assert(initial.analytics === false, "Analytics cookies default to false");
console.log("✓ PASS: Default cookie preferences state");

// 2. Custom save
const saved = saveCookiePreferences({ functional: false, analytics: true });
assert(saved.essential === true, "Essential remains true");
assert(saved.functional === false, "Functional updated to false");
assert(saved.analytics === true, "Analytics updated to true");
assert(saved.hasConsented === true, "Consent state marked true");

const retrieved = getStoredCookiePreferences();
assert(retrieved.functional === false, "Retrieved functional matches saved state");
assert(retrieved.analytics === true, "Retrieved analytics matches saved state");
console.log("✓ PASS: Custom cookie preferences saving & retrieval");

// 3. Accept All helper
const allAccepted = acceptAllCookies();
assert(allAccepted.essential === true, "Essential true on accept all");
assert(allAccepted.functional === true, "Functional true on accept all");
assert(allAccepted.analytics === true, "Analytics true on accept all");
assert(allAccepted.hasConsented === true, "Consented true on accept all");
console.log("✓ PASS: Accept all cookies workflow");

// 4. Accept Essential Only helper
const essentialOnly = acceptEssentialOnly();
assert(essentialOnly.essential === true, "Essential true on essential only");
assert(essentialOnly.functional === false, "Functional false on essential only");
assert(essentialOnly.analytics === false, "Analytics false on essential only");
assert(essentialOnly.hasConsented === true, "Consented true on essential only");
console.log("✓ PASS: Accept essential only workflow");

console.log("=== ALL COOKIE CONSENT & LEGAL TESTS PASSED ===");
