import { NATURAL_DISASTER_GUIDES } from "../data/natural-disasters";
import { getDisasterGuideBySlug } from "../services/knowledge-service";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Natural Disaster Knowledge Library Tests (Sub-Phase 4.2) ---");

// 1. Expected 13 Natural Hazards List
const expectedNaturalSlugs = [
  "flood",
  "urban-flood",
  "cyclone",
  "earthquake",
  "tsunami",
  "landslide",
  "heat-wave",
  "cold-wave",
  "drought",
  "lightning",
  "forest-fire",
  "avalanche",
  "severe-storm",
];

assert(
  NATURAL_DISASTER_GUIDES.length === 13,
  `Expected exactly 13 natural hazard guides, got ${NATURAL_DISASTER_GUIDES.length}`
);

for (const slug of expectedNaturalSlugs) {
  const guide = getDisasterGuideBySlug(slug);
  assert(guide !== undefined, `Missing natural disaster guide for slug: ${slug}`);
  if (!guide) continue;

  assert(guide.category === "natural", `Expected category 'natural' for slug: ${slug}`);
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

console.log("✓ PASS: All 13 natural disaster guides verified with full ESE curriculum alignment");
console.log("=== NATURAL DISASTER LIBRARY TESTS PASSED ===");
