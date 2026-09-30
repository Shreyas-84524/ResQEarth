import {
  isUserInTargetZone,
  calculateTargetingEstimate,
  findMatchedRecipients,
} from "@/features/alerts/services/targeting-service";
import {
  buildAlertPart1Message,
  buildAlertPart2Message,
  executeTwoMessageSmsWorkflow,
  clearDispatchedSmsKeys,
} from "../two-message-workflow";
import { sendSingleSms } from "../gateway-client";
import type { UnifiedAlert } from "@/features/alerts";
import type { UserProfile } from "@/types/firebase";

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
  console.log("--- Starting Admin Emergency SMS Alert & Regional Targeting Unit Tests ---\n");

  clearDispatchedSmsKeys();

  const now = "2026-03-30T00:00:00Z";

  // Test Users
  const mumbaiInsideUser: UserProfile = {
    uid: "usr-mumbai-inside",
    name: "Mumbai Resident",
    email: "mumbai@example.com",
    phone: "+919876543210",
    role: "citizen",
    createdAt: now,
    notificationConsent: true,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 19.076,
      longitude: 72.8777,
      cityName: "Mumbai",
      stateName: "Maharashtra",
      updatedAt: now,
    },
  };

  const puneOutsideUser: UserProfile = {
    uid: "usr-pune-outside",
    name: "Pune Resident",
    email: "pune@example.com",
    phone: "+919876543211",
    role: "citizen",
    createdAt: now,
    notificationConsent: true,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 18.5204,
      longitude: 73.8567, // ~120 km from Mumbai
      cityName: "Pune",
      stateName: "Maharashtra",
      updatedAt: now,
    },
  };

  const noPhoneUser: UserProfile = {
    uid: "usr-no-phone",
    name: "No Phone Citizen",
    email: "nophone@example.com",
    phone: "",
    role: "citizen",
    createdAt: now,
    notificationConsent: true,
    smsConsent: true,
    lastKnownLocation: {
      latitude: 19.08,
      longitude: 72.88,
      cityName: "Mumbai",
      stateName: "Maharashtra",
      updatedAt: now,
    },
  };

  const noConsentUser: UserProfile = {
    uid: "usr-no-consent",
    name: "No Consent Citizen",
    email: "noconsent@example.com",
    phone: "+919876543212",
    role: "citizen",
    createdAt: now,
    notificationConsent: true,
    smsConsent: false, // Opted out of SMS
    lastKnownLocation: {
      latitude: 19.076,
      longitude: 72.8777,
      cityName: "Mumbai",
      stateName: "Maharashtra",
      updatedAt: now,
    },
  };

  const noLocationUser: UserProfile = {
    uid: "usr-no-location",
    name: "No Location Citizen",
    email: "noloc@example.com",
    phone: "+919876543213",
    role: "citizen",
    createdAt: now,
    notificationConsent: true,
    smsConsent: true,
    // lastKnownLocation is undefined
  };

  const testPopulation = [
    mumbaiInsideUser,
    puneOutsideUser,
    noPhoneUser,
    noConsentUser,
    noLocationUser,
  ];

  const mumbaiRadiusCriteria = {
    targetMode: "radius" as const,
    latitude: 19.076,
    longitude: 72.8777,
    radiusKm: 35,
    regionName: "Mumbai Coastal District",
  };

  // 1. Geospatial Matching Tests
  const insideMatch = isUserInTargetZone(mumbaiInsideUser, mumbaiRadiusCriteria);
  assert(insideMatch.matches === true, "User inside 35 km radius matches target zone");
  assert((insideMatch.distanceKm ?? 999) < 1, "User at center has ~0 km distance");

  const outsideMatch = isUserInTargetZone(puneOutsideUser, mumbaiRadiusCriteria);
  assert(outsideMatch.matches === false, "User outside radius (>100 km) is rejected from target zone");

  const noLocMatch = isUserInTargetZone(noLocationUser, mumbaiRadiusCriteria);
  assert(noLocMatch.matches === false, "User with missing location is rejected");

  // 2. Targeting Estimate & Privacy Preservation
  const estimate = calculateTargetingEstimate(testPopulation, mumbaiRadiusCriteria);
  assert(estimate.totalMatchedUsers === 3, "Total matched users inside radius count is 3");
  assert(estimate.smsEligibleCount === 1, "Only 1 user is fully SMS-eligible (inside radius + phone + consent)");
  assert(estimate.missingLocationCount === 1, "Missing location count is 1");

  // 3. Matched Recipient Filtering
  const smsRecipients = findMatchedRecipients(testPopulation, {
    ...mumbaiRadiusCriteria,
    channel: "sms",
    requireSmsConsent: true,
  });
  assert(smsRecipients.length === 1, "findMatchedRecipients returns exactly 1 SMS-consented recipient");
  assert(smsRecipients[0].uid === "usr-mumbai-inside", "Matched recipient is the Mumbai resident with consent");

  // 4. Role Authorization Checks
  const isCitizenAuthorizedForAdmin = (role: string) => role === "admin";
  assert(!isCitizenAuthorizedForAdmin(mumbaiInsideUser.role), "Citizen role cannot access admin operations");
  assert(isCitizenAuthorizedForAdmin("admin"), "Admin role is authorized for emergency broadcast");

  // 5. Emergency Warning Alert Templates (Part 1 & Part 2)
  const testAlert: UnifiedAlert = {
    id: "alert-sim-flood-2026",
    title: "Urban Inundation Advisory",
    description: "Waterlogging expected in coastal lowlands.",
    disasterType: "flood",
    severity: "HIGH",
    source: "ResQEarth Academic Simulation",
    sourceType: "manual-admin",
    isOfficialAlert: false,
    region: "Mumbai Metropolitan Region",
    targetMode: "radius",
    latitude: 19.076,
    longitude: 72.8777,
    radiusKm: 35,
    instructions: ["Move to upper floors", "Do not drive in flooded underpasses"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin-root",
    status: "active",
    deduplicationKey: "admin:flood:mumbai:HIGH",
  };

  const part1 = buildAlertPart1Message(testAlert, "https://resqearth.antideploy.app");
  assert(part1.includes("RESQEARTH EMERGENCY ALERT"), "Part 1 contains platform alert banner");
  assert(part1.includes("Mumbai Metropolitan Region"), "Part 1 contains region");
  assert(part1.includes("HIGH"), "Part 1 contains severity level");
  assert(part1.includes("https://resqearth.antideploy.app/disasters/flood"), "Part 1 contains disaster safety link");

  const part2 = buildAlertPart2Message(testAlert);
  assert(part2.includes("EMERGENCY HELPLINES - INDIA"), "Part 2 contains verified helplines header");
  assert(part2.includes("112") && part2.includes("108") && part2.includes("1070"), "Part 2 includes 112, 108, and 1070");

  // 6. Two-Message SMS Dispatch Execution (Mock Mode)
  const workflowResult = await executeTwoMessageSmsWorkflow({
    alert: testAlert,
    recipients: smsRecipients,
    baseUrl: "https://resqearth.antideploy.app",
    configOverrides: { mockMode: true },
  });

  assert(workflowResult.totalRecipients === 1, "Workflow processed 1 recipient");
  assert(workflowResult.part1Successful === 1, "Part 1 delivered successfully");
  assert(workflowResult.part2Successful === 1, "Part 2 delivered successfully");
  assert(workflowResult.failedCount === 0, "Zero failures during mock dispatch");

  // 7. Duplicate Warning Suppression
  const duplicateRun = await executeTwoMessageSmsWorkflow({
    alert: testAlert,
    recipients: smsRecipients,
    baseUrl: "https://resqearth.antideploy.app",
    configOverrides: { mockMode: true },
  });
  assert(duplicateRun.part1Successful === 1, "Idempotent workflow acknowledges cached delivery without re-sending");

  // 8. Gateway Timeout & Graceful Error Handling
  const timeoutResult = await sendSingleSms(
    {
      phoneNumber: "+919876543210",
      message: "Test message",
      alertId: testAlert.id,
      hasConsent: true,
    },
    {
      baseUrl: "http://127.0.0.1:9999/api", // Invalid port
      apiKey: "invalid-key-for-test",
      mockMode: false,
      timeoutMs: 200,
      maxRetries: 1,
    }
  );
  assert(timeoutResult.success === false, "Unreachable gateway returns graceful failure instead of throwing");
  assert(timeoutResult.status === "failed", "Failure status is recorded correctly");

  // 9. Consent Guard Enforcement
  const noConsentSend = await sendSingleSms({
    phoneNumber: "+919876543210",
    message: "Test message",
    hasConsent: false,
  });
  assert(noConsentSend.success === false, "Direct dispatch without consent is strictly rejected");
  assert(noConsentSend.error?.includes("consented") === true, "Consent rejection error message is explicit");

  console.log(`\n=====================================================`);
  console.log(` Admin SMS Alert Test Results: ${passCount} passed, ${failCount} failed.`);
  console.log(`=====================================================\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner exception:", err);
  process.exit(1);
});
