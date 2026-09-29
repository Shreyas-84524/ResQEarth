import {
  generateAlertDeduplicationKey,
  isDuplicateAlertKey,
} from "../services/deduplication-service";

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

console.log("--- Starting Alert Deduplication Key Unit Tests ---\n");

const baseTime = new Date("2026-09-30T10:00:00.000Z");

// 1. Deterministic generation for identical parameters
const key1 = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 18.964,
  longitude: 72.825,
  timestamp: baseTime,
});

const key2 = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 18.964,
  longitude: 72.825,
  timestamp: baseTime,
});

assert(key1 === key2, "Identical inputs generate identical deduplication keys");
assert(key1.startsWith("resqearth:alert:official:imd:cyclone:mumbai_coast:"), "Key structure has standard prefix and segments");

// 2. Spatial Grid Quantization: Nearby GPS coordinates within 0.05 degrees snap to the same key
const keyNearby = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 18.968, // very close to 18.964 (~400m apart)
  longitude: 72.827,
  timestamp: baseTime,
});
assert(key1 === keyNearby, "Coordinates within same ~5km quantization grid generate same key");

// 3. Distinct GPS coordinates outside grid generate different keys
const keyFar = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 19.500, // far north (~60km away)
  longitude: 72.825,
  timestamp: baseTime,
});
assert(key1 !== keyFar, "Distant coordinates generate distinct keys");

// 4. Temporal Quantization: Timestamps within the same 6-hour bucket generate identical key
const timeInSameBucket = new Date("2026-09-30T11:30:00.000Z"); // same 6-hour window [06:00 - 12:00 UTC]
const keySameTimeBucket = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 18.964,
  longitude: 72.825,
  timestamp: timeInSameBucket,
});
assert(key1 === keySameTimeBucket, "Timestamps within same 6h bucket generate identical key");

// 5. Timestamps in a different 6-hour window generate different key
const timeInNextBucket = new Date("2026-09-30T18:00:00.000Z"); // next 6-hour bucket
const keyNextBucket = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 18.964,
  longitude: 72.825,
  timestamp: timeInNextBucket,
});
assert(key1 !== keyNextBucket, "Timestamps in different 6h buckets generate distinct keys");

// 6. Different disaster types generate distinct keys
const keyFlood = generateAlertDeduplicationKey({
  sourceType: "official",
  source: "IMD",
  disasterType: "flood",
  region: "Mumbai Coast",
  latitude: 18.964,
  longitude: 72.825,
  timestamp: baseTime,
});
assert(key1 !== keyFlood, "Different disaster types produce distinct keys");

// 7. Different source types generate distinct keys
const keyManual = generateAlertDeduplicationKey({
  sourceType: "manual-admin",
  source: "ResQEarth Admin",
  disasterType: "cyclone",
  region: "Mumbai Coast",
  latitude: 18.964,
  longitude: 72.825,
  timestamp: baseTime,
});
assert(key1 !== keyManual, "Different source types produce distinct keys");

// 8. isDuplicateAlertKey helper tests
const keySet = new Set([key1, keyFlood]);
assert(isDuplicateAlertKey(key1, keySet) === true, "isDuplicateAlertKey finds matching key in Set");
assert(isDuplicateAlertKey(keyManual, keySet) === false, "isDuplicateAlertKey returns false for new key in Set");
assert(isDuplicateAlertKey(key1, [key1, keyFlood]) === true, "isDuplicateAlertKey works with Array input");

console.log(`\nDeduplication Validation Results: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
