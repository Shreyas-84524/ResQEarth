import type { RiskLevel } from "../types";

export const RISK_MODEL_VERSION = "v1.0.0-deterministic";

export const RISK_SCORE_BANDS: Record<
  RiskLevel,
  { min: number; max: number; label: string; color: string; description: string }
> = {
  LOW: {
    min: 0,
    max: 20,
    label: "LOW",
    color: "emerald",
    description: "Nominal environmental baseline. No significant local hazard factors detected.",
  },
  GUARDED: {
    min: 21,
    max: 40,
    label: "GUARDED",
    color: "sky",
    description: "Minor environmental anomalies or elevated precipitation/wind factors present.",
  },
  MODERATE: {
    min: 41,
    max: 60,
    label: "MODERATE",
    color: "amber",
    description: "Elevated hazard conditions. Heightened vigilance recommended for vulnerable zones.",
  },
  HIGH: {
    min: 61,
    max: 80,
    label: "HIGH",
    color: "orange",
    description: "Severe hazard threat active. Prepare emergency precautions and monitor statutory updates.",
  },
  CRITICAL: {
    min: 81,
    max: 100,
    label: "CRITICAL",
    color: "red",
    description: "Imminent or active high-impact emergency. Follow official NDMA/IMD instructions immediately.",
  },
};

/**
 * Weights and thresholds for precipitation
 */
export const PRECIPITATION_WEIGHTS = {
  TORRENTIAL: { thresholdMm: 50, points: 35, name: "Extreme Cloudburst / Torrential Deluge (≥50 mm/h)" },
  HEAVY: { thresholdMm: 25, points: 25, name: "Heavy Monsoon Downpour (≥25 mm/h)" },
  MODERATE: { thresholdMm: 10, points: 15, name: "Moderate to Heavy Rainfall (≥10 mm/h)" },
  LIGHT: { thresholdMm: 2.5, points: 8, name: "Light to Moderate Rainfall (≥2.5 mm/h)" },
  HIGH_PROBABILITY: { thresholdPercent: 80, points: 8, name: "High Precipitation Probability (≥80%)" },
  MODERATE_PROBABILITY: { thresholdPercent: 50, points: 4, name: "Elevated Rain Probability (≥50%)" },
} as const;

/**
 * Weights and thresholds for wind & gusts
 */
export const WIND_WEIGHTS = {
  GUST_CYCLONIC: { thresholdKmh: 90, points: 30, name: "Violent Squall / Cyclone Gusts (≥90 km/h)" },
  GUST_GALE: { thresholdKmh: 60, points: 20, name: "Gale-Force Wind Gusts (≥60 km/h)" },
  GUST_SQUALL: { thresholdKmh: 40, points: 10, name: "Squally Wind Gusts (≥40 km/h)" },
  SUSTAINED_HIGH: { thresholdKmh: 50, points: 15, name: "Sustained High Surface Wind (≥50 km/h)" },
  SUSTAINED_MODERATE: { thresholdKmh: 30, points: 8, name: "Brisk Sustained Wind (≥30 km/h)" },
} as const;

/**
 * Weights and thresholds for extreme temperature
 */
export const TEMPERATURE_WEIGHTS = {
  HEATWAVE_SEVERE: { thresholdC: 44, points: 22, name: "Severe Heatwave Conditions (≥44°C)" },
  HEATWAVE_MODERATE: { thresholdC: 40, points: 14, name: "Heatwave Alert (≥40°C)" },
  HEAT_STRESS: { thresholdC: 37, points: 6, name: "Elevated Heat Stress (≥37°C)" },
  COLDWAVE_SEVERE: { thresholdC: 4, points: 18, name: "Severe Cold Wave Conditions (≤4°C)" },
  COLDWAVE_MODERATE: { thresholdC: 8, points: 10, name: "Cold Wave Advisory (≤8°C)" },
} as const;

/**
 * Weights for nearby earthquakes based on magnitude and distance
 */
export const EARTHQUAKE_WEIGHT_TIERS = [
  { minMag: 6.0, maxDistKm: 150, points: 45, label: "Major Nearby Earthquake (M≥6.0 within 150 km)" },
  { minMag: 5.0, maxDistKm: 100, points: 35, label: "Moderate-Strong Nearby Earthquake (M≥5.0 within 100 km)" },
  { minMag: 4.0, maxDistKm: 50, points: 20, label: "Light Nearby Earthquake (M≥4.0 within 50 km)" },
  { minMag: 4.0, maxDistKm: 150, points: 10, label: "Regional Moderate Earthquake (M≥4.0 within 150 km)" },
  { minMag: 3.0, maxDistKm: 50, points: 5, label: "Minor Nearby Seismic Tremor (M≥3.0 within 50 km)" },
] as const;

/**
 * Weights for nearby NASA EONET / Global Natural Disasters
 */
export const GLOBAL_EVENT_WEIGHT_TIERS = [
  { disasterType: "wildfire", maxDistKm: 30, points: 25, label: "Active Wildfire within 30 km" },
  { disasterType: "wildfire", maxDistKm: 60, points: 15, label: "Active Wildfire within 60 km" },
  { disasterType: "cyclone", maxDistKm: 75, points: 30, label: "Severe Cyclone / Tropical Storm within 75 km" },
  { disasterType: "cyclone", maxDistKm: 150, points: 18, label: "Cyclone / Tropical Storm within 150 km" },
  { disasterType: "flood", maxDistKm: 30, points: 25, label: "Active Flood Inundation within 30 km" },
  { disasterType: "flood", maxDistKm: 75, points: 15, label: "Active Flood Inundation within 75 km" },
  { disasterType: "landslide", maxDistKm: 25, points: 25, label: "Active Landslide / Debris Flow within 25 km" },
  { disasterType: "landslide", maxDistKm: 60, points: 15, label: "Active Landslide / Debris Flow within 60 km" },
  { disasterType: "volcano", maxDistKm: 50, points: 30, label: "Volcanic Eruption Activity within 50 km" },
] as const;

/**
 * Weights for Indian Statutory Official Alerts (NDMA SACHET / IMD)
 */
export const STATUTORY_ALERT_WEIGHTS: Record<RiskLevel, { points: number; label: string }> = {
  CRITICAL: { points: 35, label: "Official Red Alert (NDMA / IMD Statutory Warning)" },
  HIGH: { points: 25, label: "Official Orange Alert (NDMA / IMD Statutory Warning)" },
  MODERATE: { points: 15, label: "Official Yellow Alert (NDMA / IMD Statutory Warning)" },
  GUARDED: { points: 8, label: "Official Advisory / Watch (NDMA / IMD)" },
  LOW: { points: 0, label: "Nominal Official Bulletin" },
};

/**
 * Coastal exposure coefficient
 */
export const COASTAL_VULNERABILITY_POINTS = 4;
export const COASTAL_VULNERABILITY_LABEL = "Coastal Inundation Zone Vulnerability Baseline";

/**
 * Expected data feeds for confidence calculation and missing input disclosures
 */
export const EXPECTED_FEEDS = [
  { id: "weather", name: "Ambient Weather Telemetry (Open-Meteo)" },
  { id: "earthquakes", name: "Seismic Telemetry Network (USGS GeoJSON)" },
  { id: "global_events", name: "Global Natural Hazards Feed (NASA EONET v3)" },
  { id: "indian_alerts", name: "Statutory CAP Alert Broadcasts (NDMA SACHET / IMD)" },
  { id: "river_flow", name: "Catchment Gauge / Discharge Telemetry (GloFAS / River Sensors)" },
] as const;
