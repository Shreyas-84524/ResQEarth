import {
  calculateDisasterRisk,
  scoreToRiskLevel,
} from "../services/risk-engine-service";
import { RISK_MODEL_VERSION } from "../constants/risk-config";
import type { NormalizedWeather } from "@/features/weather/types/weather";
import type { UnifiedDisasterEvent } from "@/features/disasters/types/disaster-event";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Explainable Disaster Risk Engine Unit Tests ---");

// Helper mock weather
function createMockWeather(overrides: Partial<NormalizedWeather> = {}): NormalizedWeather {
  return {
    temperature: 28,
    apparentTemperature: 30,
    humidity: 65,
    precipitation: 0,
    precipitationProbability: 10,
    rain: 0,
    windSpeed: 12,
    windGusts: 18,
    weatherCode: 1,
    conditionLabel: "Mainly Clear",
    conditionDescription: "Clear skies with light breeze",
    isDay: true,
    locationName: "Mumbai, Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    updatedAt: new Date().toISOString(),
    source: "Open-Meteo",
    sourceUrl: "https://open-meteo.com",
    isStale: false,
    hourlyForecast: [],
    ...overrides,
  };
}

// Helper mock disaster
function createMockDisaster(overrides: Partial<UnifiedDisasterEvent> = {}): UnifiedDisasterEvent {
  return {
    id: "mock-disaster-1",
    provider: "usgs",
    providerEventId: "us7000test",
    disasterType: "earthquake",
    categoryKey: "earthquakes",
    categoryTitle: "Earthquake",
    title: "M 4.5 Earthquake - Western Maharashtra",
    severity: "MODERATE",
    severityScale: "Richter M4.5",
    sourceType: "official",
    sourceName: "USGS",
    sourceUrl: "https://earthquake.usgs.gov",
    isOfficialAlert: false,
    latitude: 19.1,
    longitude: 73.0,
    coordinates: [73.0, 19.1],
    geometryType: "Point",
    region: "Western Maharashtra",
    occurredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isOpen: true,
    distanceKm: 35,
    magnitudeValue: 4.5,
    ...overrides,
  };
}

// 1. scoreToRiskLevel band mapping
console.log("1. Testing scoreToRiskLevel band mappings...");
assert(scoreToRiskLevel(0) === "LOW", "0 should map to LOW");
assert(scoreToRiskLevel(15) === "LOW", "15 should map to LOW");
assert(scoreToRiskLevel(20) === "LOW", "20 boundary should map to LOW");
assert(scoreToRiskLevel(21) === "GUARDED", "21 boundary should map to GUARDED");
assert(scoreToRiskLevel(40) === "GUARDED", "40 boundary should map to GUARDED");
assert(scoreToRiskLevel(41) === "MODERATE", "41 boundary should map to MODERATE");
assert(scoreToRiskLevel(60) === "MODERATE", "60 boundary should map to MODERATE");
assert(scoreToRiskLevel(61) === "HIGH", "61 boundary should map to HIGH");
assert(scoreToRiskLevel(80) === "HIGH", "80 boundary should map to HIGH");
assert(scoreToRiskLevel(81) === "CRITICAL", "81 boundary should map to CRITICAL");
assert(scoreToRiskLevel(100) === "CRITICAL", "100 should map to CRITICAL");
assert(scoreToRiskLevel(-10) === "LOW", "Negative score clamped to LOW");
assert(scoreToRiskLevel(150) === "CRITICAL", "Overflow score clamped to CRITICAL");
console.log("   ✓ scoreToRiskLevel mapping verified (13 assertions)");

// 2. Nominal baseline conditions
console.log("2. Testing Nominal Baseline Risk Assessment...");
const baselineWeather = createMockWeather({
  precipitation: 0,
  rain: 0,
  precipitationProbability: 5,
  windSpeed: 10,
  windGusts: 15,
  temperature: 26,
});

const baselineResult = calculateDisasterRisk({
  location: { latitude: 28.6139, longitude: 77.209, city: "New Delhi", state: "Delhi" },
  weather: baselineWeather,
  disasters: [],
});

assert(baselineResult.score === 0, "Nominal baseline score should be 0");
assert(baselineResult.level === "LOW", "Nominal baseline level should be LOW");
assert(baselineResult.modelVersion === RISK_MODEL_VERSION, "Model version matches constant");
assert(baselineResult.activeOfficialAlertsCount === 0, "Zero official alerts on baseline");
assert(baselineResult.contributions.length === 0, "Zero contributing factors for clear weather");
assert(baselineResult.summaryExplanation.includes("nominal"), "Explanation contains nominal reassurance");
assert(baselineResult.confidence === "HIGH", "Confidence is HIGH when all core feeds active");
console.log("   ✓ Nominal baseline assessment verified");

// 3. Precipitation and Flood Scoring
console.log("3. Testing Precipitation and Flood Scoring...");
// Light rain (3 mm/h) inland
const lightRainResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ precipitation: 3, rain: 3 }),
  disasters: [],
});
assert(lightRainResult.score === 8, `Light rain should score 8, got ${lightRainResult.score}`);
assert(lightRainResult.level === "LOW", "Light rain level is LOW");
assert(
  (lightRainResult.hazardBreakdown.find((h) => h.category === "flood")?.score ?? 0) > 0,
  "Flood breakdown has positive score for light rain"
);

// Moderate rain (12 mm/h) inland
const modRainResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ precipitation: 12, rain: 12 }),
  disasters: [],
});
assert(modRainResult.score === 15, `Moderate rain should score 15, got ${modRainResult.score}`);
assert(modRainResult.level === "LOW", "Moderate rain level is LOW");

// Heavy monsoon downpour (28 mm/h) inland
const heavyRainResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ precipitation: 28, rain: 28 }),
  disasters: [],
});
assert(heavyRainResult.score === 25, `Heavy rain should score 25, got ${heavyRainResult.score}`);
assert(heavyRainResult.level === "GUARDED", "Heavy rain level is GUARDED");

// Torrential deluge (60 mm/h) inland
const cloudburstResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ precipitation: 60, rain: 60 }),
  disasters: [],
});
assert(cloudburstResult.score === 35, `Cloudburst should score 35, got ${cloudburstResult.score}`);
assert(cloudburstResult.level === "GUARDED", "Cloudburst level is GUARDED");

// High precipitation forecast probability
const probResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ precipitation: 0, precipitationProbability: 85 }),
  disasters: [],
});
assert(probResult.score === 8, "High precipitation probability scores 8");
assert(probResult.contributions[0].name.includes("High Precipitation Probability"), "Contribution name matched");
console.log("   ✓ Precipitation and Flood factor scoring verified");

// 4. Wind and Cyclone Scoring
console.log("4. Testing Wind and Cyclone Scoring...");
const galeResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ windGusts: 65, windSpeed: 25 }),
  disasters: [],
});
assert(galeResult.score === 20, `Gale gusts should score 20, got ${galeResult.score}`);
assert(galeResult.contributions[0].name.includes("Gale-Force Wind Gusts"), "Gale factor name matched");

const cycloneWindResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ windGusts: 105, windSpeed: 55 }),
  disasters: [],
});
assert(cycloneWindResult.score === 45, `Violent cyclone gusts + sustained wind should score 45, got ${cycloneWindResult.score}`);
assert(cycloneWindResult.level === "MODERATE", "Cyclone wind level is MODERATE");
assert(
  (cycloneWindResult.hazardBreakdown.find((h) => h.category === "storm")?.score ?? 0) >= 45,
  "Storm breakdown score reflects cyclone winds"
);
console.log("   ✓ Wind and Cyclone scoring verified");

// 5. Extreme Temperature Scoring
console.log("5. Testing Extreme Temperature Scoring...");
const heatResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ temperature: 45.5 }),
  disasters: [],
});
assert(heatResult.score === 22, `Severe heatwave should score 22, got ${heatResult.score}`);
assert(heatResult.level === "GUARDED", "Severe heatwave is GUARDED");
assert(heatResult.contributions[0].name.includes("Severe Heatwave"), "Heatwave contribution matched");

const coldResult = calculateDisasterRisk({
  location: { latitude: 28.6, longitude: 77.2, city: "Delhi" },
  weather: createMockWeather({ temperature: 2.0 }),
  disasters: [],
});
assert(coldResult.score === 18, `Severe cold wave should score 18, got ${coldResult.score}`);
assert(coldResult.contributions[0].name.includes("Severe Cold Wave"), "Cold wave contribution matched");
console.log("   ✓ Temperature scoring verified");

// 6. Nearby Seismic & Earthquake Scoring
console.log("6. Testing Nearby Earthquake Scoring...");
const eqResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: createMockWeather(),
  disasters: [
    createMockDisaster({
      magnitudeValue: 6.4,
      distanceKm: 40,
      region: "Koyna Fault Zone",
    }),
  ],
});
assert(eqResult.score === 45, `M6.4 within 40 km should score 45, got ${eqResult.score}`);
assert(eqResult.level === "MODERATE", "Major nearby earthquake is MODERATE");
assert(eqResult.contributions[0].name.includes("Major Nearby Earthquake"), "Earthquake tier label matched");

const farEqResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: createMockWeather(),
  disasters: [
    createMockDisaster({
      magnitudeValue: 3.5,
      distanceKm: 250,
    }),
  ],
});
assert(farEqResult.score === 0, "Earthquake outside 150 km radius contributes 0 points");
console.log("   ✓ Earthquake scoring and proximity bounds verified");

// 7. Global Natural Disasters (NASA EONET)
console.log("7. Testing Global Natural Disasters (NASA EONET)...");
const wildfireEvent = createMockDisaster({
  id: "eonet-fire-1",
  provider: "nasa-eonet",
  disasterType: "wildfire",
  categoryKey: "wildfires",
  categoryTitle: "Wildfire",
  title: "Active Forest Fire - Western Ghats",
  distanceKm: 22,
  isOfficialAlert: false,
});

const fireResult = calculateDisasterRisk({
  location: { latitude: 19.0, longitude: 73.0, city: "Lonavala" },
  weather: createMockWeather(),
  disasters: [wildfireEvent],
});
assert(fireResult.score === 25, `Wildfire at 22 km should score 25, got ${fireResult.score}`);
assert(fireResult.contributions[0].name.includes("Active Wildfire within 30 km"), "Wildfire tier matched");
console.log("   ✓ NASA EONET global events scoring verified");

// 8. Indian Statutory Official Alerts (NDMA / IMD)
console.log("8. Testing Indian Statutory Official Alerts...");
const officialAlert = createMockDisaster({
  id: "alert-ndma-01",
  provider: "ndma-sachet",
  disasterType: "flood",
  categoryKey: "officialAlerts",
  categoryTitle: "Official Alert",
  title: "IMD Mumbai Red Alert: Extremely Heavy Rainfall & Inundation",
  severity: "CRITICAL",
  isOfficialAlert: true,
  sourceName: "National Disaster Management Authority (NDMA)",
  distanceKm: 15,
  region: "Mumbai Urban & Suburban",
});

const alertResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: createMockWeather({ precipitation: 15, rain: 15 }),
  disasters: [officialAlert],
});

// 15 (rain) + 35 (Red Alert) + 4 (Coastal Vulnerability) = 54 pts
assert(alertResult.score === 54, `Alert result should score 54, got ${alertResult.score}`);
assert(alertResult.level === "MODERATE", "Alert result level is MODERATE");
assert(alertResult.activeOfficialAlertsCount === 1, "Official alerts count is 1");

const statutoryFactor = alertResult.contributions.find((c) => c.isOfficialStatutory);
assert(statutoryFactor !== undefined, "Statutory factor exists in contributions");
assert(statutoryFactor?.points === 35, "Statutory Red alert contributes 35 points");
assert(
  statutoryFactor?.source === "National Disaster Management Authority (NDMA)",
  "Statutory source attribution preserved"
);
console.log("   ✓ Statutory official alerts and provenance flags verified");

// 9. Coastal Vulnerability Baseline
console.log("9. Testing Coastal Vulnerability Baseline...");
const coastalResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai", state: "Maharashtra" },
  weather: createMockWeather({ precipitation: 12, rain: 12 }),
  disasters: [],
});
// 15 (rain) + 4 (coastal) = 19
assert(coastalResult.score === 19, `Coastal result should score 19, got ${coastalResult.score}`);
assert(coastalResult.contributions.some((c) => c.id === "vuln-coastal"), "Coastal vulnerability factor added");
console.log("   ✓ Coastal vulnerability factor verified");

// 10. Compound Multi-Hazard Scoring & Clamping
console.log("10. Testing Compound Multi-Hazard Scoring and Clamping...");
const officialCriticalAlert = createMockDisaster({
  id: "alert-red-1",
  provider: "ndma-sachet",
  disasterType: "flood",
  severity: "CRITICAL",
  isOfficialAlert: true,
  distanceKm: 10,
});

const majorEarthquake = createMockDisaster({
  id: "eq-major",
  magnitudeValue: 6.8,
  distanceKm: 25,
});

const extremeWeather = createMockWeather({
  precipitation: 75, // +35 pts
  rain: 75,
  windGusts: 110, // +30 pts
  windSpeed: 60, // +15 pts
});

const compoundResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: extremeWeather,
  disasters: [officialCriticalAlert, majorEarthquake],
});

assert(compoundResult.totalUnclampedPoints > 100, "Unclamped points exceed 100");
assert(compoundResult.score === 100, `Clamped score should be exactly 100, got ${compoundResult.score}`);
assert(compoundResult.level === "CRITICAL", "Level for 100 is CRITICAL");
console.log("   ✓ Compound multi-hazard clamping verified");

// 11. Missing Feeds & Graceful Degradation
console.log("11. Testing Missing Feeds & Graceful Degradation...");
const degradedResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: null,
  disasters: [],
  weatherError: "Network timeout",
});

assert(degradedResult.score === 0, "Missing weather falls back safely to 0");
assert(degradedResult.level === "LOW", "Missing weather level is LOW");
assert(degradedResult.missingInputs.includes("Ambient Weather (Open-Meteo)"), "Missing inputs lists weather");
assert(degradedResult.confidence === "MODERATE", "Confidence degraded to MODERATE");

const nullDisastersResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: createMockWeather(),
  disasters: undefined,
  disastersError: "API offline",
});

assert(nullDisastersResult.missingInputs.includes("Surveillance Feeds (USGS / EONET)"), "Missing inputs lists disasters");
console.log("   ✓ Missing feeds and zero-crash degradation verified");

// 12. Per-Hazard Breakdown Dimension Grid
console.log("12. Testing Per-Hazard Breakdown Grid Dimensions...");
const gridResult = calculateDisasterRisk({
  location: { latitude: 19.076, longitude: 72.8777, city: "Mumbai" },
  weather: createMockWeather({ precipitation: 20, windGusts: 50 }),
  disasters: [],
});

assert(gridResult.hazardBreakdown.length === 5, "All 5 hazard dimensions present");
const categories = gridResult.hazardBreakdown.map((h) => h.category);
assert(categories.includes("flood"), "Includes flood");
assert(categories.includes("storm"), "Includes storm");
assert(categories.includes("earthquake"), "Includes earthquake");
assert(categories.includes("heatwave"), "Includes heatwave");
assert(categories.includes("wildfire"), "Includes wildfire");

for (const hazard of gridResult.hazardBreakdown) {
  assert(hazard.score >= 0 && hazard.score <= 100, `Hazard score ${hazard.score} in [0, 100]`);
  assert(["LOW", "GUARDED", "MODERATE", "HIGH", "CRITICAL"].includes(hazard.level), "Valid RiskLevel");
  assert(hazard.dominantFactor.length > 0, "Dominant factor description present");
}
console.log("   ✓ Per-hazard breakdown dimensions verified");

console.log("\n========================================================");
console.log(" ALL EXPLAINABLE RISK ENGINE UNIT TESTS PASSED (12/12) ");
console.log("========================================================\n");
