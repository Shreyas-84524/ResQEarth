import {
  evaluateAndGenerateAutomaticAlerts,
  clearAutomaticAlertCooldownCache,
} from "../services/automatic-alert-engine";
import type { RiskAssessment } from "@/features/risk/types";
import type { UnifiedDisasterEvent } from "@/features/disasters/types";

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

console.log("--- Starting Automatic Alert Engine Unit Tests ---\n");

clearAutomaticAlertCooldownCache();

// Mock high-risk assessment
const highRiskAssessment: RiskAssessment = {
  score: 75,
  level: "HIGH",
  confidence: "HIGH",
  disasterType: "Torrential Rain & Coastal Inundation",
  regionName: "Mumbai, Maharashtra",
  calculatedAt: new Date().toISOString(),
  modelVersion: "v1.0.0-deterministic",
  contributions: [
    {
      id: "precip-heavy",
      name: "Torrential Rain",
      category: "precipitation",
      points: 40,
      description: "Extremely heavy monsoon rainfall rate",
      source: "Open-Meteo",
    },
    {
      id: "wind-cyclonic",
      name: "Gale Gusts",
      category: "wind",
      points: 35,
      description: "Severe wind gusts observed",
      source: "Open-Meteo",
    },
  ],
  hazardBreakdown: [
    {
      category: "flood",
      title: "Flood Risk",
      score: 75,
      level: "HIGH",
      dominantFactor: "Heavy Monsoon Rain",
      contributingPoints: 40,
    },
  ],
  summaryExplanation: "Severe precipitation and cyclonic wind conditions detected.",
  missingInputs: [],
  activeOfficialAlertsCount: 0,
  highestContributingCategory: "precipitation",
  totalUnclampedPoints: 75,
  latitude: 19.076,
  longitude: 72.8777,
};

// Mock low-risk assessment (score 15)
const lowRiskAssessment: RiskAssessment = {
  score: 15,
  level: "LOW",
  confidence: "HIGH",
  disasterType: "Nominal Conditions",
  regionName: "Mumbai, Maharashtra",
  calculatedAt: new Date().toISOString(),
  modelVersion: "v1.0.0-deterministic",
  contributions: [],
  hazardBreakdown: [],
  summaryExplanation: "Nominal conditions.",
  missingInputs: [],
  activeOfficialAlertsCount: 0,
  highestContributingCategory: "none",
  totalUnclampedPoints: 15,
  latitude: 19.076,
  longitude: 72.8777,
};

// Mock official NDMA alert
const mockOfficialEvent: UnifiedDisasterEvent = {
  id: "ndma-cyclone-01",
  provider: "ndma-sachet",
  providerEventId: "sachet-12345",
  disasterType: "cyclone",
  categoryKey: "officialAlerts",
  categoryTitle: "Official Warning",
  title: "Cyclone Alert for Konkan Coast",
  description: "Severe Cyclonic Storm moving towards coastal Maharashtra.",
  severity: "CRITICAL",
  severityScale: "IMD Cyclone Scale",
  sourceType: "official",
  sourceName: "NDMA SACHET",
  sourceUrl: "https://sachet.ndma.gov.in",
  isOfficialAlert: true,
  latitude: 18.96,
  longitude: 72.82,
  coordinates: [72.82, 18.96],
  geometryType: "Point",
  region: "Mumbai Coast",
  occurredAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  isOpen: true,
  distanceKm: 12,
};

// Mock severe earthquake (non-official USGS feed)
const mockEarthquakeEvent: UnifiedDisasterEvent = {
  id: "usgs-eq-65",
  provider: "usgs",
  providerEventId: "us6000test",
  disasterType: "earthquake",
  categoryKey: "earthquakes",
  categoryTitle: "Earthquake",
  title: "M 6.2 - Near Coast of Maharashtra",
  description: "Major seismic event detected by USGS network.",
  severity: "HIGH",
  severityScale: "Mw",
  sourceType: "automatic",
  sourceName: "USGS Earthquake Hazards Program",
  sourceUrl: "https://earthquake.usgs.gov",
  isOfficialAlert: false,
  latitude: 18.5,
  longitude: 72.9,
  coordinates: [72.9, 18.5],
  geometryType: "Point",
  region: "Konkan Offshore",
  occurredAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isOpen: true,
  distanceKm: 60,
  magnitudeValue: 6.2,
};

// 1. Evaluate Condition A: Official NDMA statutory alert
const officialResult = evaluateAndGenerateAutomaticAlerts({
  disasters: [mockOfficialEvent],
});

assert(officialResult.generatedAlerts.length === 1, "Generates alert for official NDMA event");
const officialAlert = officialResult.generatedAlerts[0];
assert(officialAlert.sourceType === "official", "Official alert has sourceType === 'official'");
assert(officialAlert.isOfficialAlert === true, "Official alert has isOfficialAlert === true");
assert(officialAlert.source === "NDMA SACHET", "Official alert preserves source name");
assert(officialAlert.title.startsWith("[OFFICIAL]"), "Official alert title is prefixed with [OFFICIAL]");
assert(Array.isArray(officialAlert.instructions) && officialAlert.instructions.length > 0, "Official alert includes safety precautions");

// 2. Evaluate Condition B: Severe USGS Earthquake surveillance event
clearAutomaticAlertCooldownCache();
const eqResult = evaluateAndGenerateAutomaticAlerts({
  disasters: [mockEarthquakeEvent],
});

assert(eqResult.generatedAlerts.length === 1, "Generates alert for major M 6.2 earthquake");
const eqAlert = eqResult.generatedAlerts[0];
assert(eqAlert.sourceType === "automatic", "Earthquake alert has sourceType === 'automatic'");
assert(eqAlert.isOfficialAlert === false, "Calculated earthquake alert has isOfficialAlert === false (Strict Invariant)");
assert(eqAlert.title.startsWith("RESQEARTH CALCULATED RISK"), "Calculated earthquake title prefixed with RESQEARTH CALCULATED RISK");

// 3. Evaluate Condition C: Risk Assessment score >= 60
clearAutomaticAlertCooldownCache();
const riskResult = evaluateAndGenerateAutomaticAlerts({
  riskAssessment: highRiskAssessment,
});

assert(riskResult.generatedAlerts.length === 1, "Generates alert when deterministic risk score >= 60");
const riskAlert = riskResult.generatedAlerts[0];
assert(riskAlert.sourceType === "automatic", "Risk alert has sourceType === 'automatic'");
assert(riskAlert.isOfficialAlert === false, "Risk alert has isOfficialAlert === false");
assert(riskAlert.title.includes("RESQEARTH CALCULATED RISK"), "Risk alert title includes RESQEARTH CALCULATED RISK");
assert(riskAlert.riskScoreSnapshot === 75, "riskScoreSnapshot accurately recorded as 75");

// 4. Low risk score (< 60) does not generate an alert
clearAutomaticAlertCooldownCache();
const lowRiskResult = evaluateAndGenerateAutomaticAlerts({
  riskAssessment: lowRiskAssessment,
});
assert(lowRiskResult.generatedAlerts.length === 0, "Low risk score does not generate alert");

// 5. Deduplication and Cooldown Suppression
clearAutomaticAlertCooldownCache();
const firstRun = evaluateAndGenerateAutomaticAlerts({
  disasters: [mockOfficialEvent],
  riskAssessment: highRiskAssessment,
});
assert(firstRun.generatedAlerts.length === 2, "First run generates 2 alerts (official + risk engine)");
assert(firstRun.suppressedCount === 0, "First run has 0 suppressed alerts");

// Immediate second run with identical inputs -> both suppressed by cooldown
const secondRun = evaluateAndGenerateAutomaticAlerts({
  disasters: [mockOfficialEvent],
  riskAssessment: highRiskAssessment,
});
assert(secondRun.generatedAlerts.length === 0, "Second run within cooldown generates 0 alerts");
assert(secondRun.suppressedCount === 2, "Second run suppresses 2 duplicate alerts");
assert(secondRun.suppressionReasons.length === 2, "Suppression reasons captured");

// 6. autoActivate flag respect
clearAutomaticAlertCooldownCache();
const draftResult = evaluateAndGenerateAutomaticAlerts(
  { riskAssessment: highRiskAssessment },
  { autoActivate: false }
);
assert(draftResult.generatedAlerts[0].status === "draft", "autoActivate: false generates 'draft' alert");

console.log(`\nAutomatic Alert Engine Validation Results: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) process.exit(1);
