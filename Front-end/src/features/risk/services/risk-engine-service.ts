import type {
  RiskAssessment,
  RiskEngineInputs,
  RiskFactorContribution,
  DisasterCategoryRisk,
  HazardCategoryKey,
  RiskConfidence,
} from "../types";
import type { RiskLevel } from "@/types";
import {
  RISK_MODEL_VERSION,
  PRECIPITATION_WEIGHTS,
  WIND_WEIGHTS,
  TEMPERATURE_WEIGHTS,
  EARTHQUAKE_WEIGHT_TIERS,
  GLOBAL_EVENT_WEIGHT_TIERS,
  STATUTORY_ALERT_WEIGHTS,
  COASTAL_VULNERABILITY_POINTS,
  COASTAL_VULNERABILITY_LABEL,
} from "../constants";

/**
 * Maps any numerical score (0–100) to its canonical RiskLevel
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped <= 20) return "LOW";
  if (clamped <= 40) return "GUARDED";
  if (clamped <= 60) return "MODERATE";
  if (clamped <= 80) return "HIGH";
  return "CRITICAL";
}

/**
 * Checks if a coordinate or region name is in a known coastal zone
 */
function isCoastalRegion(lat?: number, lon?: number, region?: string): boolean {
  if (region) {
    const lower = region.toLowerCase();
    if (
      lower.includes("mumbai") ||
      lower.includes("konkan") ||
      lower.includes("thane") ||
      lower.includes("raigad") ||
      lower.includes("ratnagiri") ||
      lower.includes("sindhudurg") ||
      lower.includes("goa") ||
      lower.includes("chennai") ||
      lower.includes("kolkata") ||
      lower.includes("kerala") ||
      lower.includes("coastal")
    ) {
      return true;
    }
  }
  if (lat !== undefined && lon !== undefined) {
    // Mumbai & Konkan coastal bounding box approximate
    if (lat >= 15.0 && lat <= 20.5 && lon >= 72.5 && lon <= 73.5) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluates weather factors (Rain, Wind, Extreme Temp)
 */
function evaluateWeatherFactors(
  weather: RiskEngineInputs["weather"],
  contributions: RiskFactorContribution[],
  hazardPoints: Record<HazardCategoryKey, number>
) {
  if (!weather) return;

  const rainMm = weather.rain ?? weather.precipitation ?? 0;
  const precipProb = weather.precipitationProbability ?? 0;
  const windKmh = weather.windSpeed ?? 0;
  const gustsKmh = weather.windGusts ?? 0;
  const tempC = weather.temperature ?? 25;

  // 1. Precipitation
  if (rainMm >= PRECIPITATION_WEIGHTS.TORRENTIAL.thresholdMm) {
    contributions.push({
      id: "precip-torrential",
      name: PRECIPITATION_WEIGHTS.TORRENTIAL.name,
      category: "precipitation",
      points: PRECIPITATION_WEIGHTS.TORRENTIAL.points,
      description: `Active torrential rainfall rate of ${rainMm.toFixed(1)} mm/h recorded. Severe flash flooding & inundation risk.`,
      source: "Open-Meteo",
      observedValue: `${rainMm.toFixed(1)} mm/h`,
    });
    hazardPoints.flood += PRECIPITATION_WEIGHTS.TORRENTIAL.points * 1.5;
  } else if (rainMm >= PRECIPITATION_WEIGHTS.HEAVY.thresholdMm) {
    contributions.push({
      id: "precip-heavy",
      name: PRECIPITATION_WEIGHTS.HEAVY.name,
      category: "precipitation",
      points: PRECIPITATION_WEIGHTS.HEAVY.points,
      description: `Intense monsoon precipitation of ${rainMm.toFixed(1)} mm/h. Waterlogging likely in low-lying catchments.`,
      source: "Open-Meteo",
      observedValue: `${rainMm.toFixed(1)} mm/h`,
    });
    hazardPoints.flood += PRECIPITATION_WEIGHTS.HEAVY.points * 1.4;
  } else if (rainMm >= PRECIPITATION_WEIGHTS.MODERATE.thresholdMm) {
    contributions.push({
      id: "precip-moderate",
      name: PRECIPITATION_WEIGHTS.MODERATE.name,
      category: "precipitation",
      points: PRECIPITATION_WEIGHTS.MODERATE.points,
      description: `Steady rainfall of ${rainMm.toFixed(1)} mm/h observed. Localized runoff in urban areas.`,
      source: "Open-Meteo",
      observedValue: `${rainMm.toFixed(1)} mm/h`,
    });
    hazardPoints.flood += PRECIPITATION_WEIGHTS.MODERATE.points * 1.2;
  } else if (rainMm >= PRECIPITATION_WEIGHTS.LIGHT.thresholdMm) {
    contributions.push({
      id: "precip-light",
      name: PRECIPITATION_WEIGHTS.LIGHT.name,
      category: "precipitation",
      points: PRECIPITATION_WEIGHTS.LIGHT.points,
      description: `Light to moderate rain of ${rainMm.toFixed(1)} mm/h.`,
      source: "Open-Meteo",
      observedValue: `${rainMm.toFixed(1)} mm/h`,
    });
    hazardPoints.flood += PRECIPITATION_WEIGHTS.LIGHT.points;
  }

  // Precipitation probability (only if light or zero current rain to avoid double penalty)
  if (rainMm < PRECIPITATION_WEIGHTS.MODERATE.thresholdMm) {
    if (precipProb >= PRECIPITATION_WEIGHTS.HIGH_PROBABILITY.thresholdPercent) {
      contributions.push({
        id: "precip-prob-high",
        name: PRECIPITATION_WEIGHTS.HIGH_PROBABILITY.name,
        category: "precipitation",
        points: PRECIPITATION_WEIGHTS.HIGH_PROBABILITY.points,
        description: `High probability (${precipProb}%) of incoming storm precipitation over next cycle.`,
        source: "Open-Meteo",
        observedValue: `${precipProb}%`,
      });
      hazardPoints.flood += PRECIPITATION_WEIGHTS.HIGH_PROBABILITY.points;
    } else if (precipProb >= PRECIPITATION_WEIGHTS.MODERATE_PROBABILITY.thresholdPercent) {
      contributions.push({
        id: "precip-prob-moderate",
        name: PRECIPITATION_WEIGHTS.MODERATE_PROBABILITY.name,
        category: "precipitation",
        points: PRECIPITATION_WEIGHTS.MODERATE_PROBABILITY.points,
        description: `Elevated probability (${precipProb}%) of precipitation forecast.`,
        source: "Open-Meteo",
        observedValue: `${precipProb}%`,
      });
      hazardPoints.flood += PRECIPITATION_WEIGHTS.MODERATE_PROBABILITY.points;
    }
  }

  // 2. Wind & Gusts
  if (gustsKmh >= WIND_WEIGHTS.GUST_CYCLONIC.thresholdKmh) {
    contributions.push({
      id: "wind-gust-cyclonic",
      name: WIND_WEIGHTS.GUST_CYCLONIC.name,
      category: "wind",
      points: WIND_WEIGHTS.GUST_CYCLONIC.points,
      description: `Extreme peak gusts of ${Math.round(gustsKmh)} km/h detected. High structural damage & uprooting hazard.`,
      source: "Open-Meteo",
      observedValue: `${Math.round(gustsKmh)} km/h`,
    });
    hazardPoints.storm += WIND_WEIGHTS.GUST_CYCLONIC.points * 1.5;
  } else if (gustsKmh >= WIND_WEIGHTS.GUST_GALE.thresholdKmh) {
    contributions.push({
      id: "wind-gust-gale",
      name: WIND_WEIGHTS.GUST_GALE.name,
      category: "wind",
      points: WIND_WEIGHTS.GUST_GALE.points,
      description: `Gale-force wind gusts of ${Math.round(gustsKmh)} km/h recorded. Squall precautions advised.`,
      source: "Open-Meteo",
      observedValue: `${Math.round(gustsKmh)} km/h`,
    });
    hazardPoints.storm += WIND_WEIGHTS.GUST_GALE.points * 1.3;
  } else if (gustsKmh >= WIND_WEIGHTS.GUST_SQUALL.thresholdKmh) {
    contributions.push({
      id: "wind-gust-squall",
      name: WIND_WEIGHTS.GUST_SQUALL.name,
      category: "wind",
      points: WIND_WEIGHTS.GUST_SQUALL.points,
      description: `Squally wind gusts of ${Math.round(gustsKmh)} km/h observed.`,
      source: "Open-Meteo",
      observedValue: `${Math.round(gustsKmh)} km/h`,
    });
    hazardPoints.storm += WIND_WEIGHTS.GUST_SQUALL.points;
  }

  // Sustained wind
  if (windKmh >= WIND_WEIGHTS.SUSTAINED_HIGH.thresholdKmh) {
    contributions.push({
      id: "wind-sustained-high",
      name: WIND_WEIGHTS.SUSTAINED_HIGH.name,
      category: "wind",
      points: WIND_WEIGHTS.SUSTAINED_HIGH.points,
      description: `Sustained high wind speed of ${Math.round(windKmh)} km/h.`,
      source: "Open-Meteo",
      observedValue: `${Math.round(windKmh)} km/h`,
    });
    hazardPoints.storm += WIND_WEIGHTS.SUSTAINED_HIGH.points;
  } else if (windKmh >= WIND_WEIGHTS.SUSTAINED_MODERATE.thresholdKmh && gustsKmh < WIND_WEIGHTS.GUST_SQUALL.thresholdKmh) {
    contributions.push({
      id: "wind-sustained-mod",
      name: WIND_WEIGHTS.SUSTAINED_MODERATE.name,
      category: "wind",
      points: WIND_WEIGHTS.SUSTAINED_MODERATE.points,
      description: `Brisk continuous surface winds of ${Math.round(windKmh)} km/h.`,
      source: "Open-Meteo",
      observedValue: `${Math.round(windKmh)} km/h`,
    });
    hazardPoints.storm += WIND_WEIGHTS.SUSTAINED_MODERATE.points;
  }

  // 3. Extreme Temperature
  if (tempC >= TEMPERATURE_WEIGHTS.HEATWAVE_SEVERE.thresholdC) {
    contributions.push({
      id: "temp-heat-severe",
      name: TEMPERATURE_WEIGHTS.HEATWAVE_SEVERE.name,
      category: "temperature",
      points: TEMPERATURE_WEIGHTS.HEATWAVE_SEVERE.points,
      description: `Dangerous ambient temperature of ${tempC.toFixed(1)}°C. Severe heat stroke & dehydration hazard.`,
      source: "Open-Meteo",
      observedValue: `${tempC.toFixed(1)}°C`,
    });
    hazardPoints.heatwave += TEMPERATURE_WEIGHTS.HEATWAVE_SEVERE.points * 1.5;
    hazardPoints.wildfire += 10;
  } else if (tempC >= TEMPERATURE_WEIGHTS.HEATWAVE_MODERATE.thresholdC) {
    contributions.push({
      id: "temp-heat-mod",
      name: TEMPERATURE_WEIGHTS.HEATWAVE_MODERATE.name,
      category: "temperature",
      points: TEMPERATURE_WEIGHTS.HEATWAVE_MODERATE.points,
      description: `Elevated heatwave condition of ${tempC.toFixed(1)}°C. Avoid prolonged outdoor exertion.`,
      source: "Open-Meteo",
      observedValue: `${tempC.toFixed(1)}°C`,
    });
    hazardPoints.heatwave += TEMPERATURE_WEIGHTS.HEATWAVE_MODERATE.points * 1.3;
    hazardPoints.wildfire += 6;
  } else if (tempC >= TEMPERATURE_WEIGHTS.HEAT_STRESS.thresholdC) {
    contributions.push({
      id: "temp-heat-stress",
      name: TEMPERATURE_WEIGHTS.HEAT_STRESS.name,
      category: "temperature",
      points: TEMPERATURE_WEIGHTS.HEAT_STRESS.points,
      description: `Warm ambient temperature of ${tempC.toFixed(1)}°C.`,
      source: "Open-Meteo",
      observedValue: `${tempC.toFixed(1)}°C`,
    });
    hazardPoints.heatwave += TEMPERATURE_WEIGHTS.HEAT_STRESS.points;
  } else if (tempC <= TEMPERATURE_WEIGHTS.COLDWAVE_SEVERE.thresholdC) {
    contributions.push({
      id: "temp-cold-severe",
      name: TEMPERATURE_WEIGHTS.COLDWAVE_SEVERE.name,
      category: "temperature",
      points: TEMPERATURE_WEIGHTS.COLDWAVE_SEVERE.points,
      description: `Severe cold wave of ${tempC.toFixed(1)}°C. Hypothermia risk for vulnerable populations.`,
      source: "Open-Meteo",
      observedValue: `${tempC.toFixed(1)}°C`,
    });
    hazardPoints.heatwave += TEMPERATURE_WEIGHTS.COLDWAVE_SEVERE.points;
  } else if (tempC <= TEMPERATURE_WEIGHTS.COLDWAVE_MODERATE.thresholdC) {
    contributions.push({
      id: "temp-cold-mod",
      name: TEMPERATURE_WEIGHTS.COLDWAVE_MODERATE.name,
      category: "temperature",
      points: TEMPERATURE_WEIGHTS.COLDWAVE_MODERATE.points,
      description: `Cold wave advisory of ${tempC.toFixed(1)}°C.`,
      source: "Open-Meteo",
      observedValue: `${tempC.toFixed(1)}°C`,
    });
    hazardPoints.heatwave += TEMPERATURE_WEIGHTS.COLDWAVE_MODERATE.points;
  }
}

/**
 * Evaluates nearby earthquakes from USGS feed
 */
function evaluateEarthquakeFactors(
  disasters: RiskEngineInputs["disasters"],
  contributions: RiskFactorContribution[],
  hazardPoints: Record<HazardCategoryKey, number>
) {
  if (!disasters || disasters.length === 0) return;

  const earthquakes = disasters.filter(
    (d) => d.disasterType === "earthquake" || d.categoryKey === "earthquakes" || d.provider === "usgs"
  );

  let bestEqTier: (typeof EARTHQUAKE_WEIGHT_TIERS)[number] | null = null;
  let matchingEq: (typeof earthquakes)[0] | null = null;

  for (const eq of earthquakes) {
    const mag = eq.magnitudeValue ?? 0;
    const dist = eq.distanceKm ?? 9999;

    for (const tier of EARTHQUAKE_WEIGHT_TIERS) {
      if (mag >= tier.minMag && dist <= tier.maxDistKm) {
        if (!bestEqTier || tier.points > bestEqTier.points) {
          bestEqTier = tier;
          matchingEq = eq;
        }
      }
    }
  }

  if (bestEqTier && matchingEq) {
    const distText = matchingEq.distanceKm !== undefined ? ` at ${Math.round(matchingEq.distanceKm)} km` : "";
    const magText = matchingEq.magnitudeValue ? `M ${matchingEq.magnitudeValue.toFixed(1)}` : "Seismic event";

    contributions.push({
      id: `eq-${matchingEq.id}`,
      name: bestEqTier.label,
      category: "earthquake",
      points: bestEqTier.points,
      description: `${magText} recorded near ${matchingEq.region}${distText}. Monitored by USGS seismic network.`,
      source: "USGS Earthquake Feed",
      observedValue: magText,
    });
    hazardPoints.earthquake += bestEqTier.points * 1.5;
  }
}

/**
 * Evaluates nearby NASA EONET / Global Natural Disasters
 */
function evaluateGlobalDisasterFactors(
  disasters: RiskEngineInputs["disasters"],
  contributions: RiskFactorContribution[],
  hazardPoints: Record<HazardCategoryKey, number>
) {
  if (!disasters || disasters.length === 0) return;

  const globalEvents = disasters.filter(
    (d) =>
      d.disasterType !== "earthquake" &&
      !d.isOfficialAlert &&
      d.provider !== "usgs" &&
      d.provider !== "ndma-sachet" &&
      d.provider !== "imd"
  );

  for (const event of globalEvents) {
    const dist = event.distanceKm ?? 9999;
    const dType = event.disasterType;

    for (const tier of GLOBAL_EVENT_WEIGHT_TIERS) {
      if (
        (tier.disasterType === dType ||
          (tier.disasterType === "flood" && (dType === "flood" || dType === "urban-flood")) ||
          (tier.disasterType === "cyclone" && (dType === "cyclone" || dType === "severe-storm" || dType === "high-wind"))) &&
        dist <= tier.maxDistKm
      ) {
        contributions.push({
          id: `global-${event.id}`,
          name: tier.label,
          category: "global_event",
          points: tier.points,
          description: `${event.title} active within ${Math.round(dist)} km (${event.region}). Monitored by ${event.sourceName}.`,
          source: event.sourceName,
          observedValue: `${Math.round(dist)} km`,
        });

        if (dType === "flood" || dType === "urban-flood") {
          hazardPoints.flood += tier.points;
        } else if (dType === "cyclone" || dType === "severe-storm" || dType === "high-wind") {
          hazardPoints.storm += tier.points;
        } else if (dType === "wildfire") {
          hazardPoints.wildfire += tier.points * 1.5;
        }
        break; // Only one tier match per event
      }
    }
  }
}

/**
 * Evaluates Indian Statutory Official Alerts (NDMA SACHET / IMD)
 */
function evaluateStatutoryAlerts(
  disasters: RiskEngineInputs["disasters"],
  contributions: RiskFactorContribution[],
  hazardPoints: Record<HazardCategoryKey, number>
): number {
  if (!disasters || disasters.length === 0) return 0;

  const officialAlerts = disasters.filter(
    (d) => d.isOfficialAlert || d.provider === "ndma-sachet" || d.provider === "imd"
  );

  let activeOfficialCount = 0;

  for (const alert of officialAlerts) {
    const dist = alert.distanceKm ?? 0;
    // Official alerts within 150 km or state/regional jurisdiction
    if (dist <= 150) {
      activeOfficialCount++;
      const alertWeight = STATUTORY_ALERT_WEIGHTS[alert.severity] ?? STATUTORY_ALERT_WEIGHTS.GUARDED;

      if (alertWeight.points > 0) {
        contributions.push({
          id: `official-${alert.id}`,
          name: `${alert.title} (${alertWeight.label})`,
          category: "official_alert",
          points: alertWeight.points,
          description: `Official statutory emergency advisory issued by ${alert.sourceName} for ${alert.region}. Severity: ${alert.severity}.`,
          source: alert.sourceName,
          isOfficialStatutory: true,
          observedValue: alert.severity,
        });

        const dtype = alert.disasterType;
        if (dtype === "flood" || dtype === "urban-flood" || dtype === "heavy-rain") {
          hazardPoints.flood += alertWeight.points;
        } else if (dtype === "cyclone" || dtype === "severe-storm" || dtype === "high-wind") {
          hazardPoints.storm += alertWeight.points;
        } else if (dtype === "earthquake") {
          hazardPoints.earthquake += alertWeight.points;
        } else if (dtype === "heat-wave" || dtype === "cold-wave") {
          hazardPoints.heatwave += alertWeight.points;
        }
      }
    }
  }

  return activeOfficialCount;
}

/**
 * Generates plain-English summary explanation
 */
function generateSummaryExplanation(
  score: number,
  level: RiskLevel,
  contributions: RiskFactorContribution[],
  regionName: string,
  missingInputs: string[]
): string {
  if (contributions.length === 0 || score <= 10) {
    return `All monitored environmental and disaster parameters for ${regionName} are nominal. No active hazard threats detected.`;
  }

  // Sort contributions descending to pick top drivers
  const sorted = [...contributions].sort((a, b) => b.points - a.points);
  const top1 = sorted[0];
  const top2 = sorted.length > 1 ? sorted[1] : null;

  let explanation = `Local risk assessed at ${score}/100 (${level}). `;

  if (top1 && top2) {
    explanation += `Primary contributing factors: ${top1.name} (+${top1.points}) and ${top2.name} (+${top2.points}).`;
  } else if (top1) {
    explanation += `Primary contributing factor: ${top1.name} (+${top1.points}).`;
  }

  if (missingInputs.length > 0) {
    explanation += ` Note: Baseline estimates applied for unavailable feeds (${missingInputs.join(", ")}).`;
  }

  return explanation;
}

/**
 * Primary deterministic risk calculation function
 */
export function calculateDisasterRisk(inputs: RiskEngineInputs): RiskAssessment {
  const { location, weather, disasters, weatherError, disastersError } = inputs;

  const lat = location?.latitude ?? 19.076;
  const lon = location?.longitude ?? 72.8777;
  const regionName =
    location?.city && location?.state
      ? `${location.city}, ${location.state}`
      : location?.city || location?.state || "Mumbai Region, Maharashtra";

  const contributions: RiskFactorContribution[] = [];
  const hazardPoints: Record<HazardCategoryKey, number> = {
    flood: 0,
    storm: 0,
    earthquake: 0,
    heatwave: 0,
    wildfire: 0,
  };

  // Missing feeds detection
  const missingInputs: string[] = [];
  let activeFeedsCount = 0;

  if (weather && !weatherError) {
    activeFeedsCount++;
    evaluateWeatherFactors(weather, contributions, hazardPoints);
  } else {
    missingInputs.push("Ambient Weather (Open-Meteo)");
  }

  if (disasters && !disastersError) {
    activeFeedsCount += 2; // USGS and EONET/NDMA
    evaluateEarthquakeFactors(disasters, contributions, hazardPoints);
    evaluateGlobalDisasterFactors(disasters, contributions, hazardPoints);
  } else {
    missingInputs.push("Surveillance Feeds (USGS / EONET)");
  }

  // Evaluate statutory official alerts
  const officialAlertsCount = evaluateStatutoryAlerts(disasters, contributions, hazardPoints);

  // Evaluate coastal vulnerability baseline if weather or storm factors exist
  const isCoastal = isCoastalRegion(lat, lon, regionName);
  const hasWeatherHazard = contributions.some(
    (c) => c.category === "precipitation" || c.category === "wind" || c.category === "official_alert"
  );

  if (isCoastal && hasWeatherHazard) {
    contributions.push({
      id: "vuln-coastal",
      name: COASTAL_VULNERABILITY_LABEL,
      category: "regional_vulnerability",
      points: COASTAL_VULNERABILITY_POINTS,
      description: "Low-lying coastal terrain & tidal exposure amplify waterlogging and squall impacts.",
      source: "ResQEarth Geographic Baseline",
      observedValue: "Coastal Zone",
    });
    hazardPoints.flood += COASTAL_VULNERABILITY_POINTS;
    hazardPoints.storm += COASTAL_VULNERABILITY_POINTS;
  }

  // Always mention river telemetry as unmonitored baseline in missing inputs if not hooked
  missingInputs.push("River Gauge Telemetry (GloFAS / Catchment Sensors)");

  // Calculate confidence
  let confidence: RiskConfidence = "HIGH";
  if (missingInputs.length >= 2) {
    confidence = activeFeedsCount >= 2 ? "MODERATE" : "LOW";
  }

  // Sum all contributions
  const totalUnclamped = contributions.reduce((sum, c) => sum + c.points, 0);
  const finalScore = Math.max(0, Math.min(100, Math.round(totalUnclamped)));
  const finalLevel = scoreToRiskLevel(finalScore);

  // Sort contributions descending by point value
  contributions.sort((a, b) => b.points - a.points);

  // Highest contributing category
  const highestCategory = contributions[0]?.category ?? "regional_vulnerability";

  // Per-hazard breakdowns
  const hazardBreakdown: DisasterCategoryRisk[] = [
    {
      category: "flood",
      title: "Flood & Inundation Risk",
      score: Math.min(100, Math.round(hazardPoints.flood)),
      level: scoreToRiskLevel(hazardPoints.flood),
      dominantFactor: "Precipitation & Drainage",
      contributingPoints: Math.round(hazardPoints.flood),
    },
    {
      category: "storm",
      title: "Cyclone & Severe Storm Risk",
      score: Math.min(100, Math.round(hazardPoints.storm)),
      level: scoreToRiskLevel(hazardPoints.storm),
      dominantFactor: "Wind Gusts & Cyclonic Systems",
      contributingPoints: Math.round(hazardPoints.storm),
    },
    {
      category: "earthquake",
      title: "Seismic Ground Shaking Risk",
      score: Math.min(100, Math.round(hazardPoints.earthquake)),
      level: scoreToRiskLevel(hazardPoints.earthquake),
      dominantFactor: "Nearby Fault Ruptures",
      contributingPoints: Math.round(hazardPoints.earthquake),
    },
    {
      category: "heatwave",
      title: "Extreme Temperature Stress",
      score: Math.min(100, Math.round(hazardPoints.heatwave)),
      level: scoreToRiskLevel(hazardPoints.heatwave),
      dominantFactor: "Thermal Thresholds",
      contributingPoints: Math.round(hazardPoints.heatwave),
    },
    {
      category: "wildfire",
      title: "Vegetation & Forest Fire Risk",
      score: Math.min(100, Math.round(hazardPoints.wildfire)),
      level: scoreToRiskLevel(hazardPoints.wildfire),
      dominantFactor: "Thermal Hotspots & Dry Winds",
      contributingPoints: Math.round(hazardPoints.wildfire),
    },
  ];

  // Determine dominant disaster title
  let dominantDisasterType = "Multi-Hazard Regional Assessment";
  const maxHazard = [...hazardBreakdown].sort((a, b) => b.score - a.score)[0];
  if (maxHazard && maxHazard.score > 20) {
    dominantDisasterType = maxHazard.title;
  }

  const summaryExplanation = generateSummaryExplanation(
    finalScore,
    finalLevel,
    contributions,
    regionName,
    missingInputs
  );

  return {
    score: finalScore,
    level: finalLevel,
    confidence,
    disasterType: dominantDisasterType,
    regionName,
    calculatedAt: new Date().toISOString(),
    modelVersion: RISK_MODEL_VERSION,
    contributions,
    hazardBreakdown,
    summaryExplanation,
    missingInputs,
    activeOfficialAlertsCount: officialAlertsCount,
    highestContributingCategory: highestCategory,
    totalUnclampedPoints: totalUnclamped,
    latitude: lat,
    longitude: lon,
  };
}
