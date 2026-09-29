import {
  getAllDisasterGuides,
  getDisasterGuideBySlug,
  getDisasterGuidesByCategory,
  searchDisasterGuides,
  getAllDisasterSlugs,
  getRelatedDisasters,
} from "../services/knowledge-service";
import { ALL_DISASTER_GUIDES } from "../data";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Disaster Knowledge Service & Architecture Tests ---");

// 1. Total counts
const allGuides = getAllDisasterGuides();
assert(allGuides.length === 22, `Expected 22 disaster guides, got ${allGuides.length}`);
console.log("✓ PASS: Total 22 disaster guides registered");

// 2. Category filters
const naturalGuides = getDisasterGuidesByCategory("natural");
assert(naturalGuides.length === 13, `Expected 13 natural guides, got ${naturalGuides.length}`);
for (const g of naturalGuides) {
  assert(g.category === "natural", `Guide ${g.slug} has wrong category ${g.category}`);
}

const manMadeGuides = getDisasterGuidesByCategory("man-made");
assert(manMadeGuides.length === 9, `Expected 9 man-made guides, got ${manMadeGuides.length}`);
for (const g of manMadeGuides) {
  assert(g.category === "man-made", `Guide ${g.slug} has wrong category ${g.category}`);
}
console.log("✓ PASS: Category filtering (13 natural, 9 man-made)");

// 3. Slug lookups
const flood = getDisasterGuideBySlug("flood");
assert(flood !== undefined && flood.title.includes("Flood"), "Found flood guide");
assert(flood?.category === "natural", "Flood is natural");

const chemical = getDisasterGuideBySlug("CHEMICAL-LEAK");
assert(chemical !== undefined && chemical.title.includes("Chemical"), "Case-insensitive chemical slug lookup");
assert(chemical?.category === "man-made", "Chemical leak is man-made");

const unknown = getDisasterGuideBySlug("alien-attack");
assert(unknown === undefined, "Unknown slug returns undefined");
console.log("✓ PASS: Slug lookup and case normalization");

// 4. Search functionality
const tsunamiSearch = searchDisasterGuides({ searchQuery: "tsunami" });
assert(tsunamiSearch.some((g) => g.slug === "tsunami"), "Found tsunami in search");

const toxicSearch = searchDisasterGuides({ searchQuery: "toxic", category: "man-made" });
assert(toxicSearch.length > 0, "Found toxic keywords in man-made category");
assert(toxicSearch.every((g) => g.category === "man-made"), "All filtered by man-made");
console.log("✓ PASS: Keyword and category search filtering");

// 5. Static parameter slug list
const slugs = getAllDisasterSlugs();
assert(slugs.length === 22, `Expected 22 slugs, got ${slugs.length}`);
assert(slugs.includes("flood"), "Slugs include flood");
assert(slugs.includes("cyclone"), "Slugs include cyclone");
assert(slugs.includes("earthquake"), "Slugs include earthquake");
assert(slugs.includes("chemical-leak"), "Slugs include chemical-leak");
assert(slugs.includes("nuclear-emergency"), "Slugs include nuclear-emergency");
console.log("✓ PASS: All disaster slugs available for static params");

// 6. Related disasters
const related = getRelatedDisasters("flood", 3);
assert(related.length === 3, `Expected 3 related disasters, got ${related.length}`);
assert(related.every((g) => g.category === "natural" && g.slug !== "flood"), "Related guides match category and exclude self");
console.log("✓ PASS: Related disasters generator");

// 7. Complete Schema and Content Validation for All 22 Guides
for (const guide of ALL_DISASTER_GUIDES) {
  assert(guide.slug.length >= 3, `Guide slug too short: ${guide.slug}`);
  assert(guide.title.length >= 4, `Guide title too short: ${guide.title}`);
  assert(["natural", "man-made"].includes(guide.category), `Invalid category for ${guide.slug}`);
  assert(guide.shortDescription.length >= 15, `Short description too short for ${guide.slug}`);
  assert(guide.iconName.length >= 2, `Missing icon name for ${guide.slug}`);
  assert(["LOW", "GUARDED", "MODERATE", "HIGH", "CRITICAL"].includes(guide.severityBaseline), `Invalid severity for ${guide.slug}`);
  assert(guide.definition.length >= 30, `Definition too short for ${guide.slug}`);

  // ESE academic fields
  assert(guide.causes.length >= 3, `Expected >= 3 causes for ${guide.slug}`);
  assert(guide.environmentalFactors.length >= 2, `Expected >= 2 environmental factors for ${guide.slug}`);
  assert(guide.warningSigns.length >= 2, `Expected >= 2 warning signs for ${guide.slug}`);
  assert(guide.humanImpacts.length >= 2, `Expected >= 2 human impacts for ${guide.slug}`);
  assert(guide.environmentalImpacts.length >= 2, `Expected >= 2 environmental impacts for ${guide.slug}`);
  assert(guide.preventionStrategies.length >= 2, `Expected >= 2 prevention strategies for ${guide.slug}`);

  // Phases
  assert(guide.phases.before.length >= 2, `Expected >= 2 before steps for ${guide.slug}`);
  assert(guide.phases.during.length >= 2, `Expected >= 2 during steps for ${guide.slug}`);
  assert(guide.phases.after.length >= 2, `Expected >= 2 after steps for ${guide.slug}`);

  // Emergency Kit & Warnings
  assert(guide.emergencyKit.length >= 3, `Expected >= 3 kit items for ${guide.slug}`);
  assert(guide.whatNotToDo.length >= 2, `Expected >= 2 whatNotToDo items for ${guide.slug}`);

  // Helplines & Resources
  assert(guide.officialHelplines.length >= 1, `Expected >= 1 helpline for ${guide.slug}`);
  assert(guide.officialResources.length >= 1, `Expected >= 1 official resource for ${guide.slug}`);
}
console.log("✓ PASS: Complete schema, ESE criteria, and content verification for all 22 disaster guides");
console.log("=== ALL 7 DISASTER KNOWLEDGE TESTS PASSED SUCCESSFULLY ===");
