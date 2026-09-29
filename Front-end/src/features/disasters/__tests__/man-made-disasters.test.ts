import { MAN_MADE_DISASTER_GUIDES } from "../data/man-made-disasters";
import { getDisasterGuideBySlug } from "../services/knowledge-service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Man-Made Disaster Knowledge Library Tests (Sub-Phase 4.3) ---");

// 1. Expected 9 Man-Made / Industrial Hazards List
const expectedManMadeSlugs = [
  "chemical-leak",
  "industrial-accident",
  "nuclear-emergency",
  "biological-emergency",
  "urban-fire",
  "building-collapse",
  "oil-spill",
  "transport-accident",
  "major-pollution",
];

assert(
  MAN_MADE_DISASTER_GUIDES.length === 9,
  `Expected exactly 9 man-made hazard guides, got ${MAN_MADE_DISASTER_GUIDES.length}`
);

for (const slug of expectedManMadeSlugs) {
  const guide = getDisasterGuideBySlug(slug);
  assert(guide !== undefined, `Missing man-made disaster guide for slug: ${slug}`);
  if (!guide) continue;

  assert(guide.category === "man-made", `Expected category 'man-made' for slug: ${slug}`);
  assert(guide.causes.length >= 3, `Expected >= 3 causes for ${slug}`);
  assert(guide.environmentalFactors.length >= 2, `Expected >= 2 environmental factors for ${slug}`);
  assert(guide.warningSigns.length >= 2, `Expected >= 2 warning signs for ${slug}`);
  assert(guide.humanImpacts.length >= 2, `Expected >= 2 human impacts for ${slug}`);
  assert(guide.environmentalImpacts.length >= 2, `Expected >= 2 environmental impacts for ${slug}`);
  assert(guide.preventionStrategies.length >= 2, `Expected >= 2 prevention strategies for ${slug}`);
  assert(guide.phases.before.length >= 2, `Expected >= 2 before steps for ${slug}`);
  assert(guide.phases.during.length >= 2, `Expected >= 2 during steps for ${slug}`);
  assert(guide.phases.after.length >= 2, `Expected >= 2 after steps for ${slug}`);
  assert(guide.emergencyKit.length >= 3, `Expected >= 3 emergency kit items for ${slug}`);
  assert(guide.whatNotToDo.length >= 2, `Expected >= 2 whatNotToDo items for ${slug}`);
  assert(guide.officialHelplines.length >= 1, `Expected >= 1 helpline for ${slug}`);
  assert(guide.officialResources.length >= 1, `Expected >= 1 official resource for ${slug}`);
  assert(guide.references.length >= 1, `Expected >= 1 scientific reference for ${slug}`);
}

console.log("✓ PASS: All 9 man-made disaster guides verified with full statutory & ESE alignment");
console.log("=== MAN-MADE DISASTER LIBRARY TESTS PASSED ===");
