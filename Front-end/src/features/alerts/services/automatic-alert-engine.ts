import type { CreateAlertInput } from "../types/alert";
import type {
  AutomaticAlertEngineConfig,
  AutomaticEvaluationInputs,
  AutomaticAlertGenerationResult,
  ActiveCooldownRecord,
} from "../types/automatic-engine";
import { generateAlertDeduplicationKey } from "./deduplication-service";

const DEFAULT_CONFIG: AutomaticAlertEngineConfig = {
  minRiskScoreThreshold: 60, // Scores >= 60 are HIGH or CRITICAL
  cooldownMs: 6 * 60 * 60 * 1000, // 6 hours
  defaultRadiusKm: 35,
  autoActivate: true,
};

// In-memory cooldown tracking store: deduplicationKey -> ActiveCooldownRecord
const cooldownStore = new Map<string, ActiveCooldownRecord>();

/**
 * Standard safety precaution templates by hazard category
 */
const HAZARD_PRECAUTIONS: Record<string, string[]> = {
  flood: [
    "Move immediately to higher ground away from rivers, nullahs, and low-lying coastal paths.",
    "Avoid walking or driving through moving floodwaters.",
    "Disconnect electrical appliances if water enters premises.",
    "Keep emergency supplies (flashlight, drinking water, medicine) ready.",
  ],
  storm: [
    "Remain indoors and keep away from glass windows and loose tin sheets.",
    "Secure loose outdoor objects and park vehicles away from large trees.",
    "Stay tuned to official weather bulletins for cyclone landfall updates.",
    "Do not venture into open sea or coastal promenades.",
  ],
  cyclone: [
    "Evacuate vulnerable coastal structures when advised by local disaster authorities.",
    "Stock adequate drinking water, non-perishable food, and first-aid kits.",
    "Turn off main gas valve and electrical breakers.",
    "Stay inside until government authorities issue the all-clear notice.",
  ],
  earthquake: [
    "Drop, Cover, and Hold On under sturdy furniture away from windows.",
    "If outdoors, move to an open area away from buildings, utility wires, and flyovers.",
    "Do not use elevators during or immediately after tremors.",
    "Check for gas leaks and structural damage before re-entering buildings.",
  ],
  heatwave: [
    "Stay hydrated with water, ORS, or lemon water; avoid direct sun between 11 AM and 4 PM.",
    "Keep pets and elderly individuals in cool, ventilated environments.",
    "Wear loose, light-colored cotton clothing.",
    "Seek immediate medical attention if experiencing heat stroke or dizziness.",
  ],
  wildfire: [
    "Close all doors and windows to prevent smoke inhalation.",
    "Prepare essential documents and follow designated evacuation routes immediately if advised.",
    "Avoid outdoor burning or open flames.",
  ],
  general: [
    "Monitor local emergency broadcasts and ResQEarth updates.",
    "Keep mobile devices charged and emergency contacts accessible.",
    "Follow all directions issued by local disaster management authorities.",
  ],
};

function getPrecautionsForHazard(hazard: string): string[] {
  const normalized = hazard.toLowerCase();
  for (const [key, precautions] of Object.entries(HAZARD_PRECAUTIONS)) {
    if (normalized.includes(key)) {
      return precautions;
    }
  }
  return HAZARD_PRECAUTIONS.general;
}

/**
 * Evaluates current disaster intelligence & risk scores to produce automatic alerts
 */
export function evaluateAndGenerateAutomaticAlerts(
  inputs: AutomaticEvaluationInputs,
  configOverrides?: Partial<AutomaticAlertEngineConfig>
): AutomaticAlertGenerationResult {
  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  const now = Date.now();
  const nowDate = new Date(now);

  const generatedAlerts: CreateAlertInput[] = [];
  const suppressionReasons: Array<{ deduplicationKey: string; reason: string }> = [];

  const { riskAssessment, disasters = [], userLat, userLon, regionName } = inputs;

  const lat = userLat ?? riskAssessment?.latitude ?? 19.076;
  const lon = userLon ?? riskAssessment?.longitude ?? 72.8777;
  const region = regionName ?? riskAssessment?.regionName ?? "Mumbai Metropolitan Region";

  // Helper to test cooldown and register
  const isSuppressedByCooldown = (key: string): boolean => {
    const record = cooldownStore.get(key);
    if (!record) return false;
    if (now > record.expiresAt) {
      cooldownStore.delete(key);
      return false;
    }
    return true;
  };

  const registerCooldown = (key: string, ttlMs: number) => {
    cooldownStore.set(key, {
      deduplicationKey: key,
      generatedAt: now,
      expiresAt: now + ttlMs,
    });
  };

  // 1. Condition A: Evaluate Statutory Official Alerts (NDMA SACHET / IMD)
  for (const event of disasters) {
    if (
      event.isOfficialAlert &&
      (event.severity === "HIGH" || event.severity === "CRITICAL" || event.severity === "MODERATE")
    ) {
      const dedupeKey = generateAlertDeduplicationKey({
        sourceType: "official",
        source: event.sourceName || "NDMA SACHET",
        disasterType: event.disasterType,
        region: event.region || region,
        latitude: event.latitude || lat,
        longitude: event.longitude || lon,
        timestamp: nowDate,
      });

      if (isSuppressedByCooldown(dedupeKey)) {
        suppressionReasons.push({
          deduplicationKey: dedupeKey,
          reason: `Official alert already triggered and in cooldown window for ${event.title}`,
        });
        continue;
      }

      // Expiry: 12 hours from now or official event expiry
      const expiresAt =
        event.expiresAt && new Date(event.expiresAt).getTime() > now
          ? new Date(event.expiresAt).toISOString()
          : new Date(now + 12 * 60 * 60 * 1000).toISOString();

      generatedAlerts.push({
        title: `[OFFICIAL] ${event.title}`,
        description:
          event.description ||
          `Statutory emergency alert issued by ${event.sourceName} for ${event.region}. Level: ${event.severity}.`,
        disasterType: event.disasterType,
        severity: event.severity,
        source: event.sourceName || "NDMA SACHET",
        sourceType: "official",
        isOfficialAlert: true, // STRICT IMMUTABILITY: official events only
        region: event.region || region,
        latitude: event.latitude || lat,
        longitude: event.longitude || lon,
        radiusKm: config.defaultRadiusKm,
        targetMode: "radius",
        instructions: getPrecautionsForHazard(event.disasterType),
        expiresAt,
        relatedDisasterEventId: event.id,
        eventIds: [event.id],
        status: config.autoActivate ? "active" : "draft",
        metadata: {
          generatedBy: "automatic-alert-engine",
          condition: "statutory_official_alert",
          provider: event.provider,
          deduplicationKey: dedupeKey,
        },
      });

      registerCooldown(dedupeKey, config.cooldownMs);
    }
  }

  // 2. Condition B: Evaluate Severe Non-Official Feeds (Major Earthquakes, Severe Cyclones, Wildfires)
  for (const event of disasters) {
    if (event.isOfficialAlert) continue; // Already processed in Condition A

    const isMajorEarthquake =
      event.disasterType === "earthquake" &&
      (event.magnitudeValue ?? 0) >= 5.0 &&
      (event.distanceKm ?? 0) <= 250;

    const isMajorStorm =
      (event.disasterType === "cyclone" || event.disasterType === "severe-storm") &&
      (event.severity === "HIGH" || event.severity === "CRITICAL") &&
      (event.distanceKm ?? 0) <= 150;

    if (isMajorEarthquake || isMajorStorm) {
      const dedupeKey = generateAlertDeduplicationKey({
        sourceType: "automatic",
        source: "ResQEarth Surveillance System",
        disasterType: event.disasterType,
        region: event.region || region,
        latitude: event.latitude || lat,
        longitude: event.longitude || lon,
        timestamp: nowDate,
      });

      if (isSuppressedByCooldown(dedupeKey)) {
        suppressionReasons.push({
          deduplicationKey: dedupeKey,
          reason: `Surveillance alert in active cooldown for ${event.title}`,
        });
        continue;
      }

      // Expiration: 6 hours for earthquake, 12 hours for storm
      const ttlHours = event.disasterType === "earthquake" ? 6 : 12;
      const expiresAt = new Date(now + ttlHours * 60 * 60 * 1000).toISOString();

      generatedAlerts.push({
        title: `RESQEARTH CALCULATED RISK: ${event.title}`,
        description:
          event.description ||
          `ResQEarth surveillance algorithms detected high-severity ${event.disasterType} event within ${Math.round(event.distanceKm || 0)} km. This is an automated calculated risk alert.`,
        disasterType: event.disasterType,
        severity: event.severity,
        source: "ResQEarth Surveillance System",
        sourceType: "automatic",
        isOfficialAlert: false, // Calculated risk is NEVER labeled official
        region: event.region || region,
        latitude: event.latitude || lat,
        longitude: event.longitude || lon,
        radiusKm: config.defaultRadiusKm,
        targetMode: "radius",
        instructions: getPrecautionsForHazard(event.disasterType),
        expiresAt,
        relatedDisasterEventId: event.id,
        eventIds: [event.id],
        status: config.autoActivate ? "active" : "draft",
        metadata: {
          generatedBy: "automatic-alert-engine",
          condition: "severe_surveillance_event",
          provider: event.provider,
          deduplicationKey: dedupeKey,
        },
      });

      registerCooldown(dedupeKey, config.cooldownMs);
    }
  }

  // 3. Condition C: Deterministic ResQEarth Risk Threshold Crossing (Score >= minRiskScoreThreshold)
  if (riskAssessment && riskAssessment.score >= config.minRiskScoreThreshold) {
    const dominantHazard = riskAssessment.hazardBreakdown
      ? [...riskAssessment.hazardBreakdown].sort((a, b) => b.score - a.score)[0]
      : null;

    const disasterType = dominantHazard?.category || "Multi-Hazard";

    const dedupeKey = generateAlertDeduplicationKey({
      sourceType: "automatic",
      source: "ResQEarth Automated Risk Engine",
      disasterType,
      region,
      latitude: lat,
      longitude: lon,
      timestamp: nowDate,
    });

    if (isSuppressedByCooldown(dedupeKey)) {
      suppressionReasons.push({
        deduplicationKey: dedupeKey,
        reason: `Calculated risk alert already active in cooldown for ${region}`,
      });
    } else {
      const ttlHours = riskAssessment.level === "CRITICAL" ? 12 : 6;
      const expiresAt = new Date(now + ttlHours * 60 * 60 * 1000).toISOString();

      generatedAlerts.push({
        title: `RESQEARTH CALCULATED RISK: Elevated ${riskAssessment.disasterType}`,
        description: `Deterministic risk engine computed regional hazard score of ${riskAssessment.score}/100 (${riskAssessment.level}) for ${region}. ${riskAssessment.summaryExplanation}`,
        disasterType,
        severity: riskAssessment.level,
        source: "ResQEarth Automated Risk Engine",
        sourceType: "automatic",
        isOfficialAlert: false, // Strictly not official
        region,
        latitude: lat,
        longitude: lon,
        radiusKm: config.defaultRadiusKm,
        targetMode: "radius",
        instructions: getPrecautionsForHazard(disasterType),
        expiresAt,
        riskScoreSnapshot: riskAssessment.score,
        status: config.autoActivate ? "active" : "draft",
        metadata: {
          generatedBy: "automatic-alert-engine",
          condition: "risk_threshold_crossed",
          score: riskAssessment.score,
          modelVersion: riskAssessment.modelVersion,
          deduplicationKey: dedupeKey,
        },
      });

      registerCooldown(dedupeKey, config.cooldownMs);
    }
  }

  return {
    generatedAlerts,
    suppressedCount: suppressionReasons.length,
    suppressionReasons,
    evaluatedAt: nowDate.toISOString(),
  };
}

/**
 * Resets the cooldown store (used for tests and cache clearing)
 */
export function clearAutomaticAlertCooldownCache(): void {
  cooldownStore.clear();
}

/**
 * Inspects a cooldown entry
 */
export function getCooldownRecord(deduplicationKey: string): ActiveCooldownRecord | undefined {
  return cooldownStore.get(deduplicationKey);
}

/**
 * Manually records a cooldown entry
 */
export function recordCooldownEntry(
  deduplicationKey: string,
  alertId?: string,
  ttlMs: number = DEFAULT_CONFIG.cooldownMs
): void {
  const now = Date.now();
  cooldownStore.set(deduplicationKey, {
    deduplicationKey,
    alertId,
    generatedAt: now,
    expiresAt: now + ttlMs,
  });
}
