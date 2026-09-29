import { ALERT_CONFIG } from "../constants";
import type { AlertSourceType } from "@/types";

export interface DeduplicationKeyParams {
  sourceType: AlertSourceType;
  source: string;
  disasterType: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  timestamp?: string | number | Date;
  timeWindowHours?: number;
}

/**
 * Normalizes text components for deterministic key hashing.
 */
function normalizeKeySegment(text?: string): string {
  if (!text) return "na";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Quantizes GPS coordinates into coarse spatial grid cells (~5 km).
 */
function quantizeCoordinate(
  coord: number | undefined,
  gridDegrees: number = ALERT_CONFIG.DEDUPLICATION_GRID_DEGREES
): string {
  if (coord === undefined || isNaN(coord)) return "na";
  const snapped = Math.round(coord / gridDegrees) * gridDegrees;
  return snapped.toFixed(3);
}

/**
 * Quantizes timestamps into temporal buckets (default 6 hours).
 */
function quantizeTimeBucket(
  timestamp?: string | number | Date,
  windowHours: number = ALERT_CONFIG.DEDUPLICATION_TIME_WINDOW_HOURS
): number {
  const dateObj =
    timestamp instanceof Date
      ? timestamp
      : typeof timestamp === "string" || typeof timestamp === "number"
      ? new Date(timestamp)
      : new Date();

  const ms = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();
  const windowMs = windowHours * 60 * 60 * 1000;
  return Math.floor(ms / windowMs);
}

/**
 * Generates a deterministic deduplication key for an alert.
 *
 * Ensures that identical event feeds or duplicate admin dispatches
 * within the same geographical grid and time window generate the same key.
 */
export function generateAlertDeduplicationKey(params: DeduplicationKeyParams): string {
  const normSourceType = normalizeKeySegment(params.sourceType);
  const normSource = normalizeKeySegment(params.source);
  const normDisaster = normalizeKeySegment(params.disasterType);
  const normRegion = normalizeKeySegment(params.region);
  const latGrid = quantizeCoordinate(params.latitude);
  const lonGrid = quantizeCoordinate(params.longitude);
  const timeBucket = quantizeTimeBucket(params.timestamp, params.timeWindowHours);

  return `resqearth:alert:${normSourceType}:${normSource}:${normDisaster}:${normRegion}:${latGrid}:${lonGrid}:${timeBucket}`;
}

/**
 * Checks if a key matches an existing active alert's deduplication key.
 */
export function isDuplicateAlertKey(
  dedupeKey: string,
  existingKeys: Set<string> | string[]
): boolean {
  if (Array.isArray(existingKeys)) {
    return existingKeys.includes(dedupeKey);
  }
  return existingKeys.has(dedupeKey);
}
