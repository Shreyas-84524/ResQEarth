import {
  earthquakeToUnifiedEvent,
  globalDisasterToUnifiedEvent,
  weatherToUnifiedEvents,
  deduplicateDisasters,
  filterUnifiedDisasters,
  unifiedDisastersToGeoJson,
  getDisasterMappingStats,
  clearUnifiedDisasterCache,
  fetchUnifiedDisasters,
} from "../services/unified-disaster-service";
import {
  normalizeIndianCapAlert,
  clearIndianAlertCache,
} from "../services/indian-alert-service";
import {
  mapIndianCapSeverity,
  mapIndianCapEventToCanonicalType,
} from "../constants/indian-alert-config";
import {
  getUnifiedDisasterMarkerRadius,
  getUnifiedSeverityColor,
} from "../constants/unified-disaster-config";
import type { NormalizedEarthquake } from "../types/earthquake";
import type { NormalizedGlobalDisaster } from "../types/global-disaster";
import type { NormalizedWeather } from "@/features/weather/types/weather";
import type {
  UnifiedDisasterEvent,
  IndianOfficialAlertRaw,
} from "../types/disaster-event";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Unified Multi-Hazard Disaster Intelligence Unit Tests ---");

// 1. Indian CAP Alert Normalization & Provenance
console.log("1. Testing Indian CAP Alert Normalization & Statutory Provenance...");
const mockCapRaw: IndianOfficialAlertRaw = {
  identifier: "NDMA-MUM-2026-TEST",
  sender: "NDMA / Maharashtra SDMA",
  sent: "2026-09-30T00:00:00Z",
  status: "Actual",
  msgType: "Alert",
  scope: "Public",
  category: "Met",
  event: "Monsoon Inundation & High-Tide Advisory",
  urgency: "Immediate",
  severity: "Severe",
  certainty: "Observed",
  headline: "High Tide Inundation & Heavy Rain Alert for Mumbai Coastal Region",
  description: "Heavy rain coinciding with high tide. Avoid low-lying subways.",
  instruction: "Stay indoors during peak tide hours.",
  web: "https://sachet.ndma.gov.in",
  areaDesc: "Mumbai Suburban (Maharashtra)",
  latitude: 19.0760,
  longitude: 72.8777,
  state: "Maharashtra",
  district: "Mumbai",
};

const capEvent = normalizeIndianCapAlert(mockCapRaw, 19.0760, 72.8777);
assert(Boolean(capEvent), "CAP event parsed");
assert(capEvent!.id === "in-alert-NDMA-MUM-2026-TEST", "ID correctly formatted");
assert(capEvent!.isOfficialAlert === true, "isOfficialAlert is strictly true for NDMA/IMD alerts");
assert(capEvent!.sourceType === "official", "sourceType is official");
assert(capEvent!.provider === "ndma-sachet", "provider is ndma-sachet");
assert(capEvent!.severity === "HIGH", "Severe maps to HIGH severity");
assert(capEvent!.severityScale === "NDMA SACHET / IMD Official Warning", "Official severity scale preserved");
assert(capEvent!.disasterType === "flood" || capEvent!.disasterType === "urban-flood", "Disaster type is flood");
assert(capEvent!.distanceKm === 0, "Distance at exact coordinates is 0 km");
assert(capEvent!.isMappable === true, "Alert with valid coordinates is marked as mappable");

// Test Indian CAP alert with missing coordinates (statewide broadcast)
const mockCapNoCoords: IndianOfficialAlertRaw = {
  ...mockCapRaw,
  identifier: "NDMA-STATEWIDE-2026",
  latitude: undefined,
  longitude: undefined,
};
const capEventNoCoords = normalizeIndianCapAlert(mockCapNoCoords);
assert(Boolean(capEventNoCoords), "Statewide CAP event parsed");
assert(capEventNoCoords!.isMappable === false, "Alert without coordinates is marked as unmappable (isMappable: false)");
assert(capEventNoCoords!.latitude === undefined, "latitude is undefined");
assert(capEventNoCoords!.longitude === undefined, "longitude is undefined");
assert(capEventNoCoords!.coordinates === undefined, "coordinates are undefined");
console.log("✓ PASS: Indian CAP alert normalization, unmappable detection, and official provenance");

// 2. CAP Severity & Category Mappers
console.log("2. Testing CAP Severity & Category Mappings...");
assert(mapIndianCapSeverity("Extreme") === "CRITICAL", "Extreme maps to CRITICAL");
assert(mapIndianCapSeverity("Severe") === "HIGH", "Severe maps to HIGH");
assert(mapIndianCapSeverity("Moderate") === "MODERATE", "Moderate maps to MODERATE");
assert(mapIndianCapSeverity("Minor") === "GUARDED", "Minor maps to GUARDED");
assert(mapIndianCapSeverity("Red") === "CRITICAL", "Red warning maps to CRITICAL");
assert(mapIndianCapSeverity("Orange") === "HIGH", "Orange warning maps to HIGH");
assert(mapIndianCapSeverity("Yellow") === "MODERATE", "Yellow warning maps to MODERATE");

const stormMapped = mapIndianCapEventToCanonicalType("Tropical Cyclone Advisory", "Deep depression tracking towards Konkan");
assert(stormMapped.disasterType === "cyclone", "Cyclone keyword maps to cyclone");
assert(stormMapped.categoryKey === "severeStorms", "Cyclone maps to severeStorms category");

const landslideMapped = mapIndianCapEventToCanonicalType("Landslide Warning", "Debris flow on NH-58");
assert(landslideMapped.disasterType === "landslide", "Landslide keyword maps to landslide");
assert(landslideMapped.categoryKey === "landslides", "Landslide maps to landslides category");
console.log("✓ PASS: CAP severity and category mapping tests");

// 3. Earthquake to Unified Event Adapter
console.log("3. Testing Earthquake to Unified Event Adapter...");
const mockEq: NormalizedEarthquake = {
  id: "usgs-test-eq-01",
  provider: "usgs",
  providerEventId: "test-eq-01",
  disasterType: "earthquake",
  title: "M 5.8 - 45 km S of Koyna, India",
  place: "Koyna, Maharashtra, India",
  magnitude: 5.8,
  depthKm: 12.5,
  latitude: 17.4,
  longitude: 73.7,
  occurredAt: "2026-09-29T18:00:00Z",
  updatedAt: "2026-09-29T18:30:00Z",
  tsunamiAlert: false,
  status: "reviewed",
  magType: "mw",
  source: "USGS Earthquake Hazards Program",
  sourceUrl: "https://earthquake.usgs.gov/earthquakes/eventpage/test-eq-01",
  severity: "HIGH",
  severityScale: "Moment Magnitude Scale (Mw)",
  distanceKm: 215,
  isStale: false,
};

const unifiedEq = earthquakeToUnifiedEvent(mockEq, 19.0760, 72.8777);
assert(unifiedEq.id === "usgs-test-eq-01", "ID preserved");
assert(unifiedEq.provider === "usgs", "Provider is usgs");
assert(unifiedEq.disasterType === "earthquake", "disasterType is earthquake");
assert(unifiedEq.categoryKey === "earthquakes", "categoryKey is earthquakes");
assert(unifiedEq.magnitudeValue === 5.8, "magnitudeValue is 5.8");
assert(unifiedEq.depthKm === 12.5, "depthKm is 12.5");
assert(unifiedEq.isOfficialAlert === false, "USGS telemetry is not an Indian statutory alert");
assert(unifiedEq.sourceType === "official", "sourceType is official agency");
assert(typeof unifiedEq.distanceKm === "number" && unifiedEq.distanceKm > 180, "Distance computed");
assert(unifiedEq.isMappable === true, "Earthquake with valid coordinates is marked as mappable");
console.log("✓ PASS: Earthquake to Unified Event adapter tests");

// 4. Global Disaster to Unified Event Adapter
console.log("4. Testing Global Disaster to Unified Event Adapter...");
const mockGlobal: NormalizedGlobalDisaster = {
  id: "eonet-6241",
  provider: "nasa-eonet",
  providerEventId: "6241",
  disasterType: "wildfire",
  categoryKey: "wildfires",
  categoryTitle: "Wildfire",
  title: "Satpura Forest Fire Complex",
  description: "Active wildfire monitored by MODIS satellite",
  geometryType: "Point",
  latitude: 22.4,
  longitude: 78.2,
  coordinates: [78.2, 22.4],
  occurredAt: "2026-09-28T12:00:00Z",
  updatedAt: "2026-09-29T12:00:00Z",
  isOpen: true,
  sources: [{ id: "MODIS", url: "https://modis.gsfc.nasa.gov" }],
  primarySource: { name: "MODIS", url: "https://modis.gsfc.nasa.gov" },
  sourceUrl: "https://eonet.gsfc.nasa.gov/api/v3/events/6241",
  magnitudeValue: 12000,
  magnitudeUnit: "Acres",
  severity: "MODERATE",
  severityScale: "ResQEarth / EONET classification",
  distanceKm: 650,
  isStale: false,
};

const unifiedGlobal = globalDisasterToUnifiedEvent(mockGlobal, 19.0760, 72.8777);
assert(unifiedGlobal.id === "eonet-6241", "ID preserved");
assert(unifiedGlobal.provider === "nasa-eonet", "Provider is nasa-eonet");
assert(unifiedGlobal.disasterType === "wildfire", "disasterType is wildfire");
assert(unifiedGlobal.categoryKey === "wildfires", "categoryKey is wildfires");
assert(unifiedGlobal.severity === "MODERATE", "severity is MODERATE");
assert(unifiedGlobal.isOfficialAlert === false, "EONET is automatic classification");
assert(unifiedGlobal.sourceType === "automatic", "sourceType is automatic");
assert(unifiedGlobal.isMappable === true, "Global disaster with valid coordinates is marked as mappable");
console.log("✓ PASS: Global Disaster to Unified Event adapter tests");

// 5. Severe Weather Telemetry Hazard Extraction
console.log("5. Testing Weather Telemetry Hazard Extraction...");
const mockNormalWeather: NormalizedWeather = {
  temperature: 28,
  apparentTemperature: 30,
  humidity: 65,
  precipitation: 2.0,
  precipitationProbability: 30,
  rain: 2.0,
  windSpeed: 15,
  windGusts: 25,
  weatherCode: 2,
  conditionLabel: "Partly Cloudy",
  conditionDescription: "Partly cloudy skies",
  isDay: true,
  locationName: "Mumbai",
  latitude: 19.076,
  longitude: 72.8777,
  updatedAt: new Date().toISOString(),
  source: "Open-Meteo",
  sourceUrl: "https://open-meteo.com",
  isStale: false,
  hourlyForecast: [],
};

const normalWxEvents = weatherToUnifiedEvents(mockNormalWeather);
assert(normalWxEvents.length === 0, "Normal weather produces 0 hazard events");

const mockSevereWeather: NormalizedWeather = {
  ...mockNormalWeather,
  precipitation: 35.0, // Heavy rain exceeding 25 mm/hr threshold
  windGusts: 72.0, // High wind exceeding 60 km/h threshold
  temperature: 43.5, // Extreme heat exceeding 42°C threshold
};

const severeWxEvents = weatherToUnifiedEvents(mockSevereWeather, 19.076, 72.8777);
assert(severeWxEvents.length === 3, "Severe weather produced 3 hazard events (rain, wind, heat)");
assert(severeWxEvents.some((e) => e.disasterType === "heavy-rain" && e.severity === "HIGH"), "Heavy rain event created with HIGH severity");
assert(severeWxEvents.some((e) => e.disasterType === "high-wind" && e.severity === "HIGH"), "High wind event created with HIGH severity");
assert(severeWxEvents.some((e) => e.disasterType === "heat-wave" && e.severity === "HIGH"), "Heat wave event created with HIGH severity");
assert(severeWxEvents.every((e) => e.isOfficialAlert === false), "Weather telemetry events are labeled automatic");
console.log("✓ PASS: Weather telemetry hazard extraction tests");

// 6. Spatial & Temporal Deduplication
console.log("6. Testing Spatial & Temporal Deduplication...");
const event1: UnifiedDisasterEvent = {
  id: "event-a",
  provider: "nasa-eonet",
  providerEventId: "fire-01",
  disasterType: "wildfire",
  categoryKey: "wildfires",
  categoryTitle: "Wildfire",
  title: "Wildfire Feed A",
  severity: "MODERATE",
  severityScale: "EONET",
  sourceType: "automatic",
  sourceName: "NASA",
  sourceUrl: "https://eonet.gsfc.nasa.gov",
  isOfficialAlert: false,
  isMappable: true,
  latitude: 19.05,
  longitude: 72.85,
  coordinates: [72.85, 19.05],
  geometryType: "Point",
  region: "Mumbai",
  occurredAt: "2026-09-30T00:00:00Z",
  updatedAt: "2026-09-30T00:00:00Z",
  isOpen: true,
};

// Event 2 is 4 km away from Event 1 within 1 hour, but has HIGH severity & official alert
const event2Duplicate: UnifiedDisasterEvent = {
  ...event1,
  id: "event-b",
  provider: "ndma-sachet",
  providerEventId: "fire-02",
  title: "Official Wildfire Order",
  severity: "HIGH",
  isOfficialAlert: true,
  isMappable: true,
  sourceType: "official",
  latitude: 19.08,
  longitude: 72.88,
  coordinates: [72.88, 19.08],
  occurredAt: "2026-09-30T01:00:00Z",
};

// Event 3 is 200 km away (distinct event)
const event3Distinct: UnifiedDisasterEvent = {
  ...event1,
  id: "event-c",
  providerEventId: "fire-03",
  isMappable: true,
  latitude: 21.0,
  longitude: 75.0,
  coordinates: [75.0, 21.0],
};

// Event 4 has NO coordinates (e.g. statewide weather bulletin)
const eventWithoutCoords: UnifiedDisasterEvent = {
  id: "event-no-coords",
  provider: "ndma-sachet",
  providerEventId: "advisory-statewide",
  disasterType: "flood",
  categoryKey: "floods",
  categoryTitle: "Floods",
  title: "Statewide Flood Advisory",
  severity: "HIGH",
  severityScale: "NDMA Advisory",
  sourceType: "official",
  sourceName: "NDMA",
  sourceUrl: "https://sachet.ndma.gov.in",
  isOfficialAlert: true,
  isMappable: false,
  latitude: undefined,
  longitude: undefined,
  coordinates: undefined,
  geometryType: undefined,
  region: "Maharashtra State",
  occurredAt: "2026-09-30T00:00:00Z",
  updatedAt: "2026-09-30T00:00:00Z",
  isOpen: true,
};

const dedupeInput = [event1, event2Duplicate, event3Distinct, eventWithoutCoords];
const dedupeResult = deduplicateDisasters(dedupeInput);
assert(dedupeResult.length === 3, "Duplicate within 15 km merged (2 remaining); unmappable event preserved (total 3)");
assert(dedupeResult.some((e) => e.isOfficialAlert === true && e.id === "event-b"), "More authoritative official alert retained");
assert(dedupeResult.some((e) => e.id === "event-no-coords"), "Event without coordinates remains present in canonical dataset");
console.log("✓ PASS: Spatial and temporal deduplication tests with unmappable hazard preservation");

// 7. Multi-Criteria Filtering
console.log("7. Testing Multi-Criteria Filtering...");
const filterTestPool: UnifiedDisasterEvent[] = [
  { ...event1, id: "pool-1", disasterType: "earthquake", categoryKey: "earthquakes", severity: "LOW", isOfficialAlert: false, region: "Pune" },
  { ...event1, id: "pool-2", disasterType: "cyclone", categoryKey: "severeStorms", severity: "CRITICAL", isOfficialAlert: false, region: "Ratnagiri" },
  { ...event1, id: "pool-3", disasterType: "flood", categoryKey: "floods", severity: "HIGH", isOfficialAlert: true, region: "Mumbai", distanceKm: 5 },
  { ...event1, id: "pool-4", disasterType: "heat-wave", categoryKey: "weatherAlerts", severity: "MODERATE", isOfficialAlert: false, region: "Nagpur", distanceKm: 800 },
];

// Category Filter
const quakesOnly = filterUnifiedDisasters(filterTestPool, { category: "earthquakes" });
assert(quakesOnly.length === 1 && quakesOnly[0].id === "pool-1", "Category filter works");

// Official Only Filter
const officialOnly = filterUnifiedDisasters(filterTestPool, { officialOnly: true });
assert(officialOnly.length === 1 && officialOnly[0].id === "pool-3", "Official only filter works");

// Min Severity Filter (HIGH and above)
const highAndAbove = filterUnifiedDisasters(filterTestPool, { minSeverity: "HIGH" });
assert(highAndAbove.length === 2, "Min severity HIGH returns CRITICAL and HIGH (2 events)");

// Max Distance Filter (< 50 km)
const nearbyOnly = filterUnifiedDisasters(filterTestPool, { maxDistanceKm: 50 });
assert(nearbyOnly.length === 1 && nearbyOnly[0].id === "pool-3", "Max distance filter works");

// Search Query Filter
const searchResults = filterUnifiedDisasters(filterTestPool, { searchQuery: "ratnagiri" });
assert(searchResults.length === 1 && searchResults[0].id === "pool-2", "Search query filter matches region");
console.log("✓ PASS: Multi-criteria filtering tests");

// 8. GeoJSON FeatureCollection Generation for MapLibre
console.log("8. Testing GeoJSON FeatureCollection Generation & Unmappable Exclusion...");
const mixedPool: UnifiedDisasterEvent[] = [...filterTestPool, eventWithoutCoords];
const sampleGeoJson = unifiedDisastersToGeoJson(mixedPool);
assert(sampleGeoJson.type === "FeatureCollection", "GeoJSON type is FeatureCollection");
assert(sampleGeoJson.features.length === 4, "Only 4 mappable features created; unmappable event cleanly excluded");
assert(!sampleGeoJson.features.some((f) => f.id === "event-no-coords"), "Event without coordinates excluded from GeoJSON Point features");
assert(sampleGeoJson.features[0]!.geometry.type === "Point", "Geometry type is Point");
assert(sampleGeoJson.features[0]!.properties!.category === "unified-disaster", "Category property set");
assert(typeof sampleGeoJson.features[0]!.properties!.markerRadius === "number", "markerRadius set");
console.log("✓ PASS: GeoJSON conversion for MapLibre cleanly excludes unmappable hazards");

// 8b. Tracking Hazard Mapping Metrics
console.log("8b. Testing Hazard Mapping Metrics (total, mappable, missingCoordinates)...");
const stats = getDisasterMappingStats(mixedPool);
assert(stats.total === 5, "Total count is 5");
assert(stats.mappable === 4, "Mappable count is 4");
assert(stats.missingCoordinates === 1, "Missing coordinate count is 1");
console.log("✓ PASS: Hazard mapping metrics tracking");

// 9. Visual Styling Expression & Radius Helpers
console.log("9. Testing Visual Styling Expressions & Radii...");
assert(getUnifiedDisasterMarkerRadius("CRITICAL", "earthquake", 7.2) === 24, "M7.2 earthquake gets 24px radius");
assert(getUnifiedDisasterMarkerRadius("HIGH", "flood") === 17, "HIGH flood gets 17px radius");
assert(getUnifiedDisasterMarkerRadius("LOW", "other") === 8, "LOW event gets 8px radius");
assert(getUnifiedSeverityColor("CRITICAL") === "#dc2626", "CRITICAL gets red color");
assert(getUnifiedSeverityColor("LOW") === "#10b981", "LOW gets emerald color");
console.log("✓ PASS: Visual styling and radius helpers");

// 10. Cache Management
clearUnifiedDisasterCache();
clearIndianAlertCache();
console.log("✓ PASS: Cache clearing");

// 11. Concurrent Feed Aggregator & Cache Test
async function runAsyncTests() {
  console.log("11. Testing Concurrent Feed Aggregator...");
  const aggregateResult = await fetchUnifiedDisasters({
    userLat: 19.0760,
    userLon: 72.8777,
  });
  assert(Array.isArray(aggregateResult), "fetchUnifiedDisasters returns an array");
  assert(aggregateResult.length > 0, "Aggregate feed contains active Indian alerts and hazards");
  console.log(`✓ PASS: Concurrent feed aggregator returned ${aggregateResult.length} events`);
  console.log("\nAll Unified Multi-Hazard Disaster Intelligence tests passed successfully!\n");
}

void runAsyncTests();
