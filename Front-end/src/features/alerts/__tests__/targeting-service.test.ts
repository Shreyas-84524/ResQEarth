import {
  isUserInTargetZone,
  calculateTargetingEstimate,
  findMatchedRecipients,
  MOCK_RECIPIENT_USERS,
} from "../services/targeting-service";
import type { UserProfile } from "@/types/firebase";
import type { TargetRecipientCriteria } from "../types/targeting";

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

console.log("--- Starting Regional & Nearby User Matching Unit Tests ---\n");

const sampleMumbaiUser: UserProfile = {
  uid: "u-mumbai",
  name: "Mumbai Citizen",
  email: "mumbai@example.com",
  phone: "+919876543210",
  role: "citizen",
  createdAt: "2026-01-01T00:00:00Z",
  notificationConsent: true,
  smsConsent: true,
  lastKnownLocation: {
    latitude: 19.076,
    longitude: 72.8777,
    cityName: "Mumbai",
    stateName: "Maharashtra",
    updatedAt: "2026-03-30T00:00:00Z",
  },
};

const sampleThaneUser: UserProfile = {
  uid: "u-thane",
  name: "Thane Citizen",
  email: "thane@example.com",
  phone: "+919876543211",
  role: "citizen",
  createdAt: "2026-01-02T00:00:00Z",
  notificationConsent: true,
  smsConsent: false,
  lastKnownLocation: {
    latitude: 19.2183,
    longitude: 72.9781,
    cityName: "Thane",
    stateName: "Maharashtra",
    updatedAt: "2026-03-30T00:00:00Z",
  },
};

const sampleDelhiUser: UserProfile = {
  uid: "u-delhi",
  name: "Delhi Citizen",
  email: "delhi@example.com",
  phone: "+919876543212",
  role: "citizen",
  createdAt: "2026-01-01T00:00:00Z",
  notificationConsent: false,
  smsConsent: true,
  lastKnownLocation: {
    latitude: 28.6139,
    longitude: 77.209,
    cityName: "New Delhi",
    stateName: "Delhi",
    updatedAt: "2026-03-30T00:00:00Z",
  },
};

const sampleNoLocationUser: UserProfile = {
  uid: "u-noloc",
  name: "No Loc",
  email: "noloc@example.com",
  phone: "+919876543213",
  role: "citizen",
  createdAt: "2026-01-01T00:00:00Z",
  notificationConsent: true,
  smsConsent: true,
};

const sampleInvalidCoordsUser: UserProfile = {
  uid: "u-invalid",
  name: "Invalid Loc",
  email: "invalid@example.com",
  phone: "+919876543214",
  role: "citizen",
  createdAt: "2026-01-01T00:00:00Z",
  notificationConsent: true,
  smsConsent: true,
  lastKnownLocation: {
    latitude: 199.0, // Invalid lat > 90
    longitude: 72.8777,
    cityName: "Unknown",
    stateName: "Unknown",
    updatedAt: "2026-03-30T00:00:00Z",
  },
};

// 1. Target mode 'all'
const allCriteria: TargetRecipientCriteria = { targetMode: "all" };
assert(isUserInTargetZone(sampleMumbaiUser, allCriteria).matches === true, "all mode matches Mumbai user");
assert(isUserInTargetZone(sampleNoLocationUser, allCriteria).matches === true, "all mode matches user without location");
assert(isUserInTargetZone(sampleInvalidCoordsUser, allCriteria).matches === true, "all mode matches user with invalid coords");

// 2. Target mode 'radius'
const radiusCriteria: TargetRecipientCriteria = {
  targetMode: "radius",
  latitude: 18.940,
  longitude: 72.835,
  radiusKm: 25,
};

const mumbaiRadiusRes = isUserInTargetZone(sampleMumbaiUser, radiusCriteria);
assert(mumbaiRadiusRes.matches === true, "radius mode matches user within 25km radius");
assert(typeof mumbaiRadiusRes.distanceKm === "number" && mumbaiRadiusRes.distanceKm <= 25, "distance calculated and is <= 25km");

const thaneRadiusRes = isUserInTargetZone(sampleThaneUser, radiusCriteria);
assert(thaneRadiusRes.matches === false, "radius mode excludes user outside 25km radius");
assert(typeof thaneRadiusRes.distanceKm === "number" && thaneRadiusRes.distanceKm > 25, "thane distance > 25km");

const delhiRadiusRes = isUserInTargetZone(sampleDelhiUser, radiusCriteria);
assert(delhiRadiusRes.matches === false, "radius mode excludes user in different state/far distance");

assert(isUserInTargetZone(sampleNoLocationUser, radiusCriteria).matches === false, "radius mode rejects user with missing location");
assert(isUserInTargetZone(sampleInvalidCoordsUser, radiusCriteria).matches === false, "radius mode rejects user with invalid coordinates");

// Invalid center coordinates in criteria
const invalidCenterCriteria: TargetRecipientCriteria = {
  targetMode: "radius",
  latitude: 999,
  longitude: 72.8777,
  radiusKm: 50,
};
assert(isUserInTargetZone(sampleMumbaiUser, invalidCenterCriteria).matches === false, "radius mode rejects invalid criteria center coords");

// 3. Target mode 'city'
const cityCriteria: TargetRecipientCriteria = {
  targetMode: "city",
  cityName: "mumbai",
};
assert(isUserInTargetZone(sampleMumbaiUser, cityCriteria).matches === true, "city mode matches city case-insensitively");
assert(isUserInTargetZone(sampleThaneUser, cityCriteria).matches === false, "city mode rejects different city");
assert(isUserInTargetZone(sampleNoLocationUser, cityCriteria).matches === false, "city mode rejects missing location");

// 4. Target mode 'state'
const stateCriteria: TargetRecipientCriteria = {
  targetMode: "state",
  stateName: "Maharashtra",
};
assert(isUserInTargetZone(sampleMumbaiUser, stateCriteria).matches === true, "state mode matches Mumbai user in Maharashtra");
assert(isUserInTargetZone(sampleThaneUser, stateCriteria).matches === true, "state mode matches Thane user in Maharashtra");
assert(isUserInTargetZone(sampleDelhiUser, stateCriteria).matches === false, "state mode rejects Delhi user");

// 5. Target mode 'region'
const regionCriteria: TargetRecipientCriteria = {
  targetMode: "region",
  regionName: "delhi",
};
assert(isUserInTargetZone(sampleDelhiUser, regionCriteria).matches === true, "region mode matches Delhi query");
assert(isUserInTargetZone(sampleMumbaiUser, regionCriteria).matches === false, "region mode rejects non-matching region");

// 6. calculateTargetingEstimate
const estimateAll = calculateTargetingEstimate(MOCK_RECIPIENT_USERS, { targetMode: "all" });
assert(estimateAll.targetMode === "all", "estimateAll targetMode is 'all'");
assert(estimateAll.totalMatchedUsers === MOCK_RECIPIENT_USERS.length, "estimateAll total matches all mock users");
assert(estimateAll.fcmEligibleCount > 0, "estimateAll counts FCM eligible users");
assert(estimateAll.smsEligibleCount > 0, "estimateAll counts SMS eligible users");
assert(estimateAll.missingLocationCount === 1, "estimateAll counts missing location users");
assert(estimateAll.invalidLocationCount === 1, "estimateAll counts invalid coords users");
assert(estimateAll.summaryDescription.includes("All users"), "summaryDescription formatted correctly");

const estimateRadius = calculateTargetingEstimate(MOCK_RECIPIENT_USERS, {
  targetMode: "radius",
  latitude: 19.076,
  longitude: 72.8777,
  radiusKm: 30,
});
assert(estimateRadius.targetMode === "radius", "estimateRadius targetMode is 'radius'");
assert(estimateRadius.totalMatchedUsers >= 2, "estimateRadius matches nearby Mumbai users");

const estimateEmpty = calculateTargetingEstimate([], { targetMode: "all" });
assert(estimateEmpty.totalMatchedUsers === 0, "estimateEmpty returns 0 for empty list");

// 7. findMatchedRecipients
const allRecipients = findMatchedRecipients([sampleMumbaiUser, sampleThaneUser, sampleDelhiUser], {
  targetMode: "all",
});
assert(allRecipients.length === 3, "findMatchedRecipients returns all 3 for 'all' mode");

const smsRecipients = findMatchedRecipients([sampleMumbaiUser, sampleThaneUser, sampleDelhiUser], {
  targetMode: "all",
  requireSmsConsent: true,
});
assert(smsRecipients.length === 2, "requireSmsConsent filters out user with smsConsent false");
assert(!smsRecipients.some((r) => r.uid === "u-thane"), "u-thane excluded from SMS recipients");

const fcmRecipients = findMatchedRecipients([sampleMumbaiUser, sampleThaneUser, sampleDelhiUser], {
  targetMode: "all",
  requireNotificationConsent: true,
});
assert(fcmRecipients.length === 2, "requireNotificationConsent filters out user with notificationConsent false");
assert(!fcmRecipients.some((r) => r.uid === "u-delhi"), "u-delhi excluded from FCM recipients");

const fcmChannelOnly = findMatchedRecipients([sampleMumbaiUser, sampleThaneUser, sampleDelhiUser], {
  targetMode: "all",
  channel: "fcm",
});
assert(fcmChannelOnly.length === 2, "channel 'fcm' filters correctly");

const smsChannelOnly = findMatchedRecipients([sampleMumbaiUser, sampleThaneUser, sampleDelhiUser], {
  targetMode: "all",
  channel: "sms",
});
assert(smsChannelOnly.length === 2, "channel 'sms' filters correctly");

console.log(`\nTargeting Matching Validation Results: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
