import type { RiskLevel } from "@/types";
import type { EarthquakeFeedTimeWindow } from "../types/earthquake";

export const USGS_FEED_URLS: Record<EarthquakeFeedTimeWindow, string> = {
  hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  day_all: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  "day_2.5": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
  "day_4.5": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
  day_significant: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson",
  week_all: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
};

export const EARTHQUAKE_CONFIG = {
  defaultFeed: "day_2.5" as EarthquakeFeedTimeWindow,
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes cache
  timeoutMs: 8000,
  sourceName: "USGS Earthquake Hazards Program",
  sourceUrl: "https://earthquake.usgs.gov",
} as const;

/**
 * Maps Moment/Richter magnitude to ResQEarth standard RiskLevel severity
 */
export function calculateEarthquakeSeverity(magnitude: number): RiskLevel {
  if (magnitude >= 7.0) return "CRITICAL";
  if (magnitude >= 6.0) return "HIGH";
  if (magnitude >= 4.5) return "MODERATE";
  if (magnitude >= 3.0) return "GUARDED";
  return "LOW";
}

/**
 * Calculates a dynamic circle marker radius in pixels scaled by earthquake magnitude
 */
export function getEarthquakeMarkerRadius(magnitude: number): number {
  if (magnitude <= 1) return 5;
  if (magnitude <= 3) return 7;
  if (magnitude <= 4.5) return 10;
  if (magnitude <= 6.0) return 14;
  if (magnitude <= 7.0) return 18;
  return 24;
}
