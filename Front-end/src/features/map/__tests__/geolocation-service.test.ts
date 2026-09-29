import {
  DEFAULT_FALLBACK_LOCATION,
  LOCATION_STORAGE_KEY,
} from "../constants/geolocation-defaults";
import {
  getSavedSessionLocation,
  saveSessionLocation,
  clearSessionLocation,
} from "../services/geolocation-service";
import type { NormalizedLocation } from "../types/geolocation";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Geolocation Service Unit Tests ---");

// 1. Invariants of Default Fallback Location
assert(DEFAULT_FALLBACK_LOCATION.city === "Mumbai", "Default fallback city is Mumbai");
assert(DEFAULT_FALLBACK_LOCATION.state === "Maharashtra", "Default fallback state is Maharashtra");
assert(DEFAULT_FALLBACK_LOCATION.country === "India", "Default fallback country is India");
assert(DEFAULT_FALLBACK_LOCATION.source === "fallback", "Default source is fallback");
assert(
  DEFAULT_FALLBACK_LOCATION.latitude >= 18.8 && DEFAULT_FALLBACK_LOCATION.latitude <= 19.3,
  "Default latitude is in Mumbai range"
);
assert(
  DEFAULT_FALLBACK_LOCATION.longitude >= 72.7 && DEFAULT_FALLBACK_LOCATION.longitude <= 73.1,
  "Default longitude is in Mumbai range"
);
assert(typeof DEFAULT_FALLBACK_LOCATION.timestamp === "string", "Timestamp is present");
console.log("✓ PASS: Default fallback location invariants");

// 2. Mock SessionStorage tests for Node environment
const mockStorage: Record<string, string> = {};
const customGlobal = globalThis as unknown as {
  window: unknown;
  sessionStorage: {
    getItem: (key: string) => string | null;
    setItem: (key: string, val: string) => void;
    removeItem: (key: string) => void;
  };
};

customGlobal.window = globalThis;
customGlobal.sessionStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
};

// Test saving and reading session location
const testLoc: NormalizedLocation = {
  locality: "Kothrud",
  city: "Pune",
  district: "Pune",
  state: "Maharashtra",
  country: "India",
  formattedAddress: "Kothrud, Pune, Maharashtra, India",
  latitude: 18.5074,
  longitude: 73.8077,
  accuracyMeters: 45,
  source: "gps",
  timestamp: new Date().toISOString(),
};

saveSessionLocation(testLoc);
assert(mockStorage[LOCATION_STORAGE_KEY] !== undefined, "Location written to storage key");

const loaded = getSavedSessionLocation();
assert(loaded !== null, "Session location loaded successfully");
if (loaded) {
  assert(loaded.city === "Pune", "Loaded city matches Pune");
  assert(loaded.source === "gps", "Loaded source matches gps");
  assert(loaded.latitude === 18.5074, "Loaded latitude matches");
  assert(loaded.accuracyMeters === 45, "Loaded accuracy matches");
}
console.log("✓ PASS: Session storage save & restore tests");

// Test clearing session location
clearSessionLocation();
assert(getSavedSessionLocation() === null, "Cleared session returns null");
console.log("✓ PASS: Clear session storage tests");

console.log("\nAll Geolocation Service unit tests passed successfully!\n");
