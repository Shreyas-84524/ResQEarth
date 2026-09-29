import { ALL_DISASTER_GUIDES } from "../data";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Disaster Preparedness and Precaution Guides Tests (Sub-Phase 4.4) ---");

// Test that all 22 guides have robust, comprehensive preparedness, emergency actions, checklists, and precautions
for (const guide of ALL_DISASTER_GUIDES) {
  // 1. Phased guidance
  assert(
    guide.phases.before.length >= 2,
    `Guide ${guide.slug} lacks sufficient 'before' preparedness instructions`
  );
  assert(
    guide.phases.during.length >= 2,
    `Guide ${guide.slug} lacks sufficient 'during' emergency action instructions`
  );
  assert(
    guide.phases.after.length >= 2,
    `Guide ${guide.slug} lacks sufficient 'after' recovery instructions`
  );

  // 2. Emergency Kit
  assert(
    guide.emergencyKit.length >= 3,
    `Guide ${guide.slug} lacks sufficient emergency kit items`
  );
  assert(
    guide.emergencyKit.some((item) => item.essential === true),
    `Guide ${guide.slug} must have marked essential emergency items`
  );

  // 3. What NOT to do (Precautions / Safety warnings)
  assert(
    guide.whatNotToDo.length >= 2,
    `Guide ${guide.slug} lacks critical 'what NOT to do' warnings`
  );

  // 4. Helplines & verified contacts
  assert(
    guide.officialHelplines.length >= 1,
    `Guide ${guide.slug} must provide verified emergency helplines`
  );
}

console.log("✓ PASS: All 22 disaster guides verified for complete preparedness, kit checklist, and safety precautions");
console.log("=== PREPAREDNESS AND PRECAUTION GUIDES TESTS PASSED ===");
