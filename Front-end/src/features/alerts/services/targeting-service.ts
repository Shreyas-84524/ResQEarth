import type { UserProfile } from "@/types/firebase";
import type {
  TargetRecipientCriteria,
  TargetingPreviewEstimate,
  MatchedRecipient,
  UserLocationMatchResult,
} from "../types/targeting";
import {
  calculateHaversineDistanceKm,
  isValidCoordinate,
} from "@/features/map/services/geojson-helper";

/**
 * Evaluates whether an individual user matches the target criteria
 */
export function isUserInTargetZone(
  user: UserProfile,
  criteria: TargetRecipientCriteria
): UserLocationMatchResult {
  const { targetMode } = criteria;

  if (targetMode === "all") {
    return {
      matches: true,
      reason: "Targeting all registered users",
    };
  }

  const loc = user.lastKnownLocation;

  if (!loc) {
    return {
      matches: false,
      reason: "User has no recorded location",
    };
  }

  // 1. Radius mode
  if (targetMode === "radius") {
    const centerLat = criteria.latitude;
    const centerLon = criteria.longitude;
    const radiusKm = criteria.radiusKm ?? 25;

    if (
      centerLat === undefined ||
      centerLon === undefined ||
      !isValidCoordinate(centerLon, centerLat)
    ) {
      return {
        matches: false,
        reason: "Invalid target center coordinates provided in criteria",
      };
    }

    if (
      loc.latitude === undefined ||
      loc.longitude === undefined ||
      !isValidCoordinate(loc.longitude, loc.latitude)
    ) {
      return {
        matches: false,
        reason: "User coordinates are missing or invalid",
      };
    }

    const distance = calculateHaversineDistanceKm(
      [centerLon, centerLat],
      [loc.longitude, loc.latitude]
    );

    if (distance <= radiusKm) {
      return {
        matches: true,
        distanceKm: distance,
        reason: `User is ${distance} km from center (within ${radiusKm} km radius)`,
      };
    }

    return {
      matches: false,
      distanceKm: distance,
      reason: `User is ${distance} km from center (outside ${radiusKm} km radius)`,
    };
  }

  // Helper for text matching
  const normalize = (s?: string) => s?.toLowerCase().trim() || "";

  // 2. City mode
  if (targetMode === "city") {
    const targetCity = normalize(criteria.cityName || criteria.regionName);
    const userCity = normalize(loc.cityName);

    if (!targetCity) {
      return { matches: false, reason: "No target city specified in criteria" };
    }

    if (!userCity) {
      return { matches: false, reason: "User has no city recorded" };
    }

    if (userCity === targetCity || userCity.includes(targetCity) || targetCity.includes(userCity)) {
      return {
        matches: true,
        reason: `User city '${loc.cityName}' matches target city '${criteria.cityName || criteria.regionName}'`,
      };
    }

    return {
      matches: false,
      reason: `User city '${loc.cityName}' does not match target city '${criteria.cityName || criteria.regionName}'`,
    };
  }

  // 3. State mode
  if (targetMode === "state") {
    const targetState = normalize(criteria.stateName || criteria.regionName);
    const userState = normalize(loc.stateName);

    if (!targetState) {
      return { matches: false, reason: "No target state specified in criteria" };
    }

    if (!userState) {
      return { matches: false, reason: "User has no state recorded" };
    }

    if (
      userState === targetState ||
      userState.includes(targetState) ||
      targetState.includes(userState)
    ) {
      return {
        matches: true,
        reason: `User state '${loc.stateName}' matches target state '${criteria.stateName || criteria.regionName}'`,
      };
    }

    return {
      matches: false,
      reason: `User state '${loc.stateName}' does not match target state '${criteria.stateName || criteria.regionName}'`,
    };
  }

  // 4. Region mode (broad match on city or state or region text)
  if (targetMode === "region") {
    const targetRegion = normalize(criteria.regionName || criteria.stateName || criteria.cityName);
    const userCity = normalize(loc.cityName);
    const userState = normalize(loc.stateName);

    if (!targetRegion) {
      return { matches: false, reason: "No target region specified in criteria" };
    }

    const matchesCity = userCity && (userCity.includes(targetRegion) || targetRegion.includes(userCity));
    const matchesState = userState && (userState.includes(targetRegion) || targetRegion.includes(userState));

    if (matchesCity || matchesState) {
      return {
        matches: true,
        reason: `User location (${loc.cityName || ""}, ${loc.stateName || ""}) matches region '${criteria.regionName}'`,
      };
    }

    return {
      matches: false,
      reason: `User location does not match region '${criteria.regionName}'`,
    };
  }

  return {
    matches: false,
    reason: `Unknown target mode: ${targetMode}`,
  };
}

/**
 * Aggregates a privacy-preserving estimate for the targeted recipients
 * Never returns personal user data (PII)
 */
export function calculateTargetingEstimate(
  users: UserProfile[],
  criteria: TargetRecipientCriteria
): TargetingPreviewEstimate {
  let totalMatched = 0;
  let fcmEligible = 0;
  let smsEligible = 0;
  let missingLocation = 0;
  let invalidLocation = 0;

  for (const user of users) {
    const loc = user.lastKnownLocation;
    if (!loc) {
      missingLocation++;
    } else if (
      loc.latitude !== undefined &&
      loc.longitude !== undefined &&
      !isValidCoordinate(loc.longitude, loc.latitude)
    ) {
      invalidLocation++;
    }

    const matchResult = isUserInTargetZone(user, criteria);

    if (matchResult.matches) {
      totalMatched++;
      if (user.notificationConsent) {
        fcmEligible++;
      }
      if (user.smsConsent && user.phone && user.phone.trim().length >= 10) {
        smsEligible++;
      }
    }
  }

  let summaryDescription = "";
  switch (criteria.targetMode) {
    case "all":
      summaryDescription = `All users platform-wide (${totalMatched} matched)`;
      break;
    case "radius":
      summaryDescription = `${criteria.radiusKm ?? 25} km radius around [${criteria.latitude?.toFixed(4)}, ${criteria.longitude?.toFixed(4)}] (${totalMatched} matched)`;
      break;
    case "city":
      summaryDescription = `City: ${criteria.cityName || criteria.regionName || "Unspecified"} (${totalMatched} matched)`;
      break;
    case "state":
      summaryDescription = `State: ${criteria.stateName || criteria.regionName || "Unspecified"} (${totalMatched} matched)`;
      break;
    case "region":
      summaryDescription = `Region: ${criteria.regionName || "Unspecified"} (${totalMatched} matched)`;
      break;
  }

  return {
    targetMode: criteria.targetMode,
    totalMatchedUsers: totalMatched,
    fcmEligibleCount: fcmEligible,
    smsEligibleCount: smsEligible,
    inSiteEligibleCount: totalMatched,
    missingLocationCount: missingLocation,
    invalidLocationCount: invalidLocation,
    summaryDescription,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Finds individual matched recipients for backend dispatching (privileged access only)
 */
export function findMatchedRecipients(
  users: UserProfile[],
  criteria: TargetRecipientCriteria
): MatchedRecipient[] {
  const matched: MatchedRecipient[] = [];

  for (const user of users) {
    const matchResult = isUserInTargetZone(user, criteria);

    if (matchResult.matches) {
      // Channel filters if specified
      if (criteria.channel === "fcm" && !user.notificationConsent) {
        continue;
      }
      if (
        criteria.channel === "sms" &&
        (!user.smsConsent || !user.phone || user.phone.trim().length < 10)
      ) {
        continue;
      }

      if (criteria.requireNotificationConsent && !user.notificationConsent) {
        continue;
      }
      if (
        criteria.requireSmsConsent &&
        (!user.smsConsent || !user.phone || user.phone.trim().length < 10)
      ) {
        continue;
      }

      matched.push({
        uid: user.uid,
        hasFcmConsent: Boolean(user.notificationConsent),
        hasSmsConsent: Boolean(user.smsConsent && user.phone && user.phone.trim().length >= 10),
        phone: user.phone,
        distanceKm: matchResult.distanceKm,
        matchReason: matchResult.reason,
      });
    }
  }

  return matched;
}

/**
 * Sample simulated users for in-memory and offline testing
 */
export const MOCK_RECIPIENT_USERS: UserProfile[] = [
  {
    uid: "user-mumbai-1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
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
  },
  {
    uid: "user-mumbai-2-no-sms",
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "+919876543211",
    role: "citizen",
    createdAt: "2026-01-02T00:00:00Z",
    notificationConsent: true,
    smsConsent: false,
    lastKnownLocation: {
      latitude: 19.082,
      longitude: 72.881,
      cityName: "Mumbai",
      stateName: "Maharashtra",
      updatedAt: "2026-03-30T00:00:00Z",
    },
  },
  {
    uid: "user-thane-1",
    name: "Rohan Deshmukh",
    email: "rohan@example.com",
    phone: "+919876543212",
    role: "citizen",
    createdAt: "2026-01-03T00:00:00Z",
    notificationConsent: true,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 19.2183,
      longitude: 72.9781,
      cityName: "Thane",
      stateName: "Maharashtra",
      updatedAt: "2026-03-30T00:00:00Z",
    },
  },
  {
    uid: "user-pune-1",
    name: "Ananya Joshi",
    email: "ananya@example.com",
    phone: "+919876543213",
    role: "citizen",
    createdAt: "2026-01-04T00:00:00Z",
    notificationConsent: true,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 18.5204,
      longitude: 73.8567,
      cityName: "Pune",
      stateName: "Maharashtra",
      updatedAt: "2026-03-30T00:00:00Z",
    },
  },
  {
    uid: "user-delhi-1",
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "+919876543214",
    role: "citizen",
    createdAt: "2026-01-05T00:00:00Z",
    notificationConsent: false,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 28.6139,
      longitude: 77.209,
      cityName: "New Delhi",
      stateName: "Delhi",
      updatedAt: "2026-03-30T00:00:00Z",
    },
  },
  {
    uid: "user-no-location",
    name: "Sneha Rao",
    email: "sneha@example.com",
    phone: "+919876543215",
    role: "citizen",
    createdAt: "2026-01-06T00:00:00Z",
    notificationConsent: true,
    smsConsent: true,
  },
  {
    uid: "user-invalid-coords",
    name: "Karan Verma",
    email: "karan@example.com",
    phone: "+919876543216",
    role: "citizen",
    createdAt: "2026-01-07T00:00:00Z",
    notificationConsent: true,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 999,
      longitude: 999,
      cityName: "Unknown",
      stateName: "Unknown",
      updatedAt: "2026-03-30T00:00:00Z",
    },
  },
];
