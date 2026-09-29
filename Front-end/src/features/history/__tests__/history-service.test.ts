import {
  getAllHistoricalEvents,
  getHistoricalEventById,
  filterHistoricalEvents,
  getHistoricalDecades,
  getHistoricalStates,
  getHistoricalDisasterTypes,
  getHistoricalStatistics,
} from "../services/history-service";
import { INDIAN_HISTORICAL_DISASTERS } from "../data/indian-disasters";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Indian Disaster History Timeline Tests (Sub-Phase 4.5) ---");

// 1. Total historical records count
const allEvents = getAllHistoricalEvents();
assert(allEvents.length >= 15, `Expected >= 15 historical events, got ${allEvents.length}`);
console.log(`✓ PASS: Loaded ${allEvents.length} verified historical events`);

// 2. Chronological ordering (descending)
for (let i = 0; i < allEvents.length - 1; i++) {
  assert(
    allEvents[i].year >= allEvents[i + 1].year,
    `Events not sorted chronologically: ${allEvents[i].year} before ${allEvents[i + 1].year}`
  );
}
console.log("✓ PASS: Events properly sorted in descending chronological order");

// 3. Key ID lookups
const bhopal = getHistoricalEventById("bhopal-1984");
assert(bhopal !== undefined, "Found Bhopal 1984 event");
assert(bhopal?.disasterType === "chemical", "Bhopal is chemical disaster");

const tsunami = getHistoricalEventById("tsunami-2004");
assert(tsunami !== undefined, "Found 2004 Indian Ocean Tsunami");
assert(tsunami?.year === 2004, "Tsunami year is 2004");

const wayanad = getHistoricalEventById("wayanad-2024");
assert(wayanad !== undefined, "Found 2024 Wayanad Landslides");
assert(wayanad?.disasterType === "landslide", "Wayanad is landslide disaster");
console.log("✓ PASS: Direct ID lookups");

// 4. Multi-dimensional filtering
const cyclones = filterHistoricalEvents({ disasterType: "cyclone" });
assert(cyclones.length >= 3, `Expected >= 3 cyclones, got ${cyclones.length}`);
assert(cyclones.every((c) => c.disasterType === "cyclone"), "All filtered events are cyclones");

const keralaEvents = filterHistoricalEvents({ state: "Kerala" });
assert(keralaEvents.length >= 2, `Expected >= 2 Kerala events, got ${keralaEvents.length}`);

const decade2010s = filterHistoricalEvents({ decade: "2010" });
assert(decade2010s.every((e) => e.year >= 2010 && e.year < 2020), "All events in 2010s");

const searchResults = filterHistoricalEvents({ searchQuery: "evacuation" });
assert(searchResults.length > 0, "Found search results for 'evacuation'");
console.log("✓ PASS: Category, state, decade, and keyword search filters");

// 5. Decades, States, and Types extraction
const decades = getHistoricalDecades();
assert(decades.includes("1980s") && decades.includes("2020s"), "Decades span 1980s to 2020s");

const states = getHistoricalStates();
assert(states.includes("Odisha") && states.includes("Maharashtra") && states.includes("Gujarat"), "Covers major states");

const types = getHistoricalDisasterTypes();
assert(types.includes("flood") && types.includes("earthquake") && types.includes("cyclone"), "Covers key disaster types");
console.log("✓ PASS: Taxonomy helper extraction methods");

// 6. Metrics statistics
const stats = getHistoricalStatistics();
assert(stats.totalEvents === INDIAN_HISTORICAL_DISASTERS.length, "Stats match total records");
assert(stats.uniqueStatesCount >= 5, "Stats cover multiple states");
console.log("✓ PASS: Historical summary metrics generation");

// 7. Schema completeness verification for all historical records
for (const event of INDIAN_HISTORICAL_DISASTERS) {
  assert(event.id.length >= 4, `Invalid id for ${event.title}`);
  assert(event.title.length >= 5, `Title too short for ${event.id}`);
  assert(event.year >= 1980 && event.year <= 2026, `Invalid year for ${event.id}`);
  assert(event.affectedRegions.length >= 1, `Missing affected regions for ${event.id}`);
  assert(event.severitySummary.length >= 20, `Severity summary too short for ${event.id}`);
  assert(event.humanCasualties.length >= 5, `Missing casualty info for ${event.id}`);
  assert(event.economicOrInfrastructureLoss.length >= 5, `Missing loss info for ${event.id}`);
  assert(event.environmentalImpact.length >= 15, `Missing environmental impact for ${event.id}`);
  assert(event.meteorologicalOrGeologicalTrigger.length >= 15, `Missing physical trigger for ${event.id}`);
  assert(event.responseHighlights.length >= 1, `Missing response highlights for ${event.id}`);
  assert(event.policyAndInstitutionalLessonsLearned.length >= 2, `Expected >= 2 lessons learned for ${event.id}`);
  assert(event.relevanceToEseCurriculum.length >= 15, `Missing ESE relevance for ${event.id}`);
  assert(event.officialReferences.length >= 1, `Expected >= 1 official reference for ${event.id}`);
}

console.log("✓ PASS: Complete schema & ESE validation across all historical disaster records");
console.log("=== ALL INDIAN DISASTER HISTORY TESTS PASSED ===");
