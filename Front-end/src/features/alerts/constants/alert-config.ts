import type { AlertStatus, TargetMode, DeliveryChannel } from "../types";
import type { RiskLevel, AlertSourceType } from "@/types";

export const ALERT_SOURCE_TYPES: readonly AlertSourceType[] = [
  "official",
  "automatic",
  "manual-admin",
] as const;

export const ALERT_STATUSES: readonly AlertStatus[] = [
  "draft",
  "active",
  "expired",
  "cancelled",
  "superseded",
] as const;

export const ALERT_SEVERITIES: readonly RiskLevel[] = [
  "LOW",
  "GUARDED",
  "MODERATE",
  "HIGH",
  "CRITICAL",
] as const;

export const TARGET_MODES: readonly TargetMode[] = [
  "all",
  "state",
  "city",
  "region",
  "radius",
] as const;

export const DELIVERY_CHANNELS: readonly DeliveryChannel[] = [
  "in-site",
  "fcm",
  "sms",
] as const;

/**
 * Known official disaster management sources with statutory provenance.
 */
export const STATUTORY_OFFICIAL_SOURCES = [
  "NDMA SACHET",
  "IMD",
  "CWC",
  "INCOIS",
  "SDMA Maharashtra",
  "MCGM Disaster Management",
] as const;

/**
 * Default expiration horizons in hours based on alert severity.
 */
export const DEFAULT_ALERT_EXPIRY_HOURS: Record<RiskLevel, number> = {
  LOW: 48,
  GUARDED: 24,
  MODERATE: 12,
  HIGH: 6,
  CRITICAL: 4,
};

export const ALERT_CONFIG = {
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 300,
  MIN_DESCRIPTION_LENGTH: 5,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_INSTRUCTIONS_COUNT: 20,
  MAX_INSTRUCTION_LENGTH: 500,
  MAX_RADIUS_KM: 500,
  DEFAULT_RADIUS_KM: 25,
  DEDUPLICATION_GRID_DEGREES: 0.05, // ~5 km coordinate quantization grid
  DEDUPLICATION_TIME_WINDOW_HOURS: 6, // 6-hour temporal deduplication window
} as const;

/**
 * Valid state machine transitions for Alert lifecycle.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<AlertStatus, readonly AlertStatus[]> = {
  draft: ["active", "cancelled"],
  active: ["expired", "cancelled", "superseded"],
  expired: [],
  cancelled: [],
  superseded: [],
};
