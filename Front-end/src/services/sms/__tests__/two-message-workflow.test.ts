import {
  buildAlertPart1Message,
  buildAlertPart2Message,
  executeTwoMessageSmsWorkflow,
  clearDispatchedSmsKeys,
} from "../two-message-workflow";
import type { UnifiedAlert } from "@/features/alerts";
import type { MatchedRecipient } from "@/features/alerts/types/targeting";

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
  console.log("--- Starting Two-Message Emergency SMS Workflow Unit Tests ---\n");

  clearDispatchedSmsKeys();

  const mockOfficialAlert: UnifiedAlert = {
    id: "alert-imd-flood-99",
    title: "Heavy Rainfall and Inundation Warning",
    description: "Extremely heavy monsoon downpour expected over the next 24 hours.",
    disasterType: "flood",
    severity: "CRITICAL",
    source: "IMD",
    sourceType: "official",
    isOfficialAlert: true,
    region: "Mumbai Coast",
    targetMode: "radius",
    instructions: [
      "Avoid low-lying areas and move valuables to higher floors.",
      "Do not venture into floodwaters.",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin-system",
    status: "active",
    deduplicationKey: "key-imd-99",
  };

  const mockCalculatedAlert: UnifiedAlert = {
    id: "alert-risk-storm-88",
    title: "Gale Wind Gusts Detected",
    description: "Squall line approaching coastal settlements.",
    disasterType: "cyclone",
    severity: "HIGH",
    source: "ResQEarth Automated Risk Engine",
    sourceType: "automatic",
    isOfficialAlert: false,
    region: "Konkan Belt",
    targetMode: "radius",
    instructions: ["Secure loose tin sheets.", "Stay indoors away from windows."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    createdBy: "system-risk-engine",
    status: "active",
    deduplicationKey: "key-storm-88",
  };

  // 1. Template generation: Part 1
  const part1Official = buildAlertPart1Message(mockOfficialAlert, "https://resqearth.org");
  assert(part1Official.includes("[OFFICIAL ALERT - IMD]"), "Official Part 1 message contains statutory provenance header");
  assert(part1Official.includes("Mumbai Coast"), "Part 1 contains region");
  assert(part1Official.includes("CRITICAL"), "Part 1 contains severity level");
  assert(part1Official.includes("https://resqearth.org/disasters/flood"), "Part 1 contains slug deep link");

  const part1Calculated = buildAlertPart1Message(mockCalculatedAlert, "https://resqearth.org");
  assert(part1Calculated.includes("[RESQEARTH EMERGENCY ALERT]"), "Calculated Part 1 message contains platform alert header");

  // 2. Template generation: Part 2 (Emergency SOS Helplines)
  const part2 = buildAlertPart2Message(mockOfficialAlert);
  assert(part2.includes("[EMERGENCY HELPLINES - INDIA]"), "Part 2 contains verified helpline header");
  assert(part2.includes("112"), "Part 2 contains National Emergency 112");
  assert(part2.includes("108"), "Part 2 contains Ambulance 108");
  assert(part2.includes("1070"), "Part 2 contains Disaster response helpline 1070");
  assert(part2.includes(mockOfficialAlert.id.slice(0, 8)), "Part 2 contains correlated alert reference ID");

  // 3. Workflow Execution with Matched Recipients
  const recipients: MatchedRecipient[] = [
    {
      uid: "usr-1",
      phone: "+919876543210",
      hasFcmConsent: true,
      hasSmsConsent: true,
      matchReason: "User in Mumbai zone",
    },
    {
      uid: "usr-2-no-consent",
      phone: "+919876543211",
      hasFcmConsent: true,
      hasSmsConsent: false, // Should be skipped
      matchReason: "User in Mumbai zone",
    },
    {
      uid: "usr-3",
      phone: "+919876543212",
      hasFcmConsent: false,
      hasSmsConsent: true,
      matchReason: "User in Mumbai zone",
    },
  ];

  const workflowResult = await executeTwoMessageSmsWorkflow({
    alert: mockOfficialAlert,
    recipients,
    configOverrides: { mockMode: true },
  });

  assert(workflowResult.totalRecipients === 3, "Total recipients passed is 3");
  assert(workflowResult.part1Successful === 2, "Part 1 successfully sent to 2 opted-in users");
  assert(workflowResult.part2Successful === 2, "Part 2 successfully sent to 2 opted-in users");
  assert(workflowResult.recipientResults.length === 2, "Only users with valid phone and consent were dispatched");

  // 4. Idempotency Check: Running same workflow again avoids double-send
  const duplicateRunResult = await executeTwoMessageSmsWorkflow({
    alert: mockOfficialAlert,
    recipients,
    configOverrides: { mockMode: true },
  });

  assert(duplicateRunResult.part1Successful === 2, "Idempotent run acknowledges existing dispatch");
  assert(duplicateRunResult.part2Successful === 2, "Idempotent run acknowledges existing part 2 dispatch");

  console.log(`\nTwo-Message Workflow Validation Results: ${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
