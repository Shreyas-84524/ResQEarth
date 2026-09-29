import type { RiskLevel } from "@/types";
import type {
  UnifiedDisasterCategory,
  CanonicalDisasterType,
  DisasterProvider,
} from "../types/disaster-event";

export const UNIFIED_DISASTER_CONFIG = {
  cacheTtlMs: 5 * 60 * 1000, // 5 minutes cache
  timeoutMs: 12000, // 12 seconds aggregate timeout
  deduplicationDistanceKm: 15, // 15 km spatial dedupe threshold
  deduplicationTimeWindowMs: 6 * 60 * 60 * 1000, // 6 hours temporal dedupe threshold
} as const;

export interface UnifiedCategoryMeta {
  key: UnifiedDisasterCategory;
  title: string;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

export const UNIFIED_CATEGORIES: Record<UnifiedDisasterCategory, UnifiedCategoryMeta> = {
  all: {
    key: "all",
    title: "All Hazards",
    color: "#64748b", // slate-500
    badgeVariant: "outline",
  },
  officialAlerts: {
    key: "officialAlerts",
    title: "Official Government Alerts",
    color: "#dc2626", // red-600
    badgeVariant: "destructive",
  },
  earthquakes: {
    key: "earthquakes",
    title: "Earthquakes",
    color: "#9333ea", // purple-600
    badgeVariant: "default",
  },
  wildfires: {
    key: "wildfires",
    title: "Wildfires",
    color: "#ea580c", // orange-600
    badgeVariant: "destructive",
  },
  severeStorms: {
    key: "severeStorms",
    title: "Cyclones & Severe Storms",
    color: "#0284c7", // sky-600
    badgeVariant: "default",
  },
  floods: {
    key: "floods",
    title: "Floods & Inundation",
    color: "#2563eb", // blue-600
    badgeVariant: "default",
  },
  landslides: {
    key: "landslides",
    title: "Landslides",
    color: "#d97706", // amber-600
    badgeVariant: "secondary",
  },
  volcanoes: {
    key: "volcanoes",
    title: "Volcanoes",
    color: "#e11d48", // rose-600
    badgeVariant: "destructive",
  },
  weatherAlerts: {
    key: "weatherAlerts",
    title: "Severe Weather Alerts",
    color: "#eab308", // yellow-500
    badgeVariant: "secondary",
  },
};

export interface ProviderMeta {
  id: DisasterProvider;
  name: string;
  shortName: string;
  sourceType: "official" | "automatic";
  website: string;
}

export const DISASTER_PROVIDERS: Record<DisasterProvider, ProviderMeta> = {
  usgs: {
    id: "usgs",
    name: "United States Geological Survey",
    shortName: "USGS",
    sourceType: "official",
    website: "https://earthquake.usgs.gov",
  },
  "nasa-eonet": {
    id: "nasa-eonet",
    name: "NASA Earth Observatory (EONET v3)",
    shortName: "NASA EONET",
    sourceType: "automatic",
    website: "https://eonet.gsfc.nasa.gov",
  },
  "open-meteo": {
    id: "open-meteo",
    name: "Open-Meteo Weather Model",
    shortName: "Open-Meteo",
    sourceType: "automatic",
    website: "https://open-meteo.com",
  },
  "ndma-sachet": {
    id: "ndma-sachet",
    name: "NDMA SACHET (Govt. of India)",
    shortName: "NDMA SACHET",
    sourceType: "official",
    website: "https://sachet.ndma.gov.in",
  },
  imd: {
    id: "imd",
    name: "India Meteorological Department (Govt. of India)",
    shortName: "IMD",
    sourceType: "official",
    website: "https://mausam.imd.gov.in",
  },
};

/**
 * Dynamic marker radius in pixels for Unified MapLibre vector layers
 */
export function getUnifiedDisasterMarkerRadius(
  severity: RiskLevel,
  disasterType: CanonicalDisasterType,
  magnitudeValue?: number | null
): number {
  if (disasterType === "earthquake" && typeof magnitudeValue === "number") {
    if (magnitudeValue >= 7.0) return 24;
    if (magnitudeValue >= 6.0) return 20;
    if (magnitudeValue >= 5.0) return 16;
    if (magnitudeValue >= 4.0) return 12;
    if (magnitudeValue >= 3.0) return 9;
    return 6;
  }

  switch (severity) {
    case "CRITICAL":
      return 22;
    case "HIGH":
      return 17;
    case "MODERATE":
      return 13;
    case "GUARDED":
      return 10;
    case "LOW":
    default:
      return 8;
  }
}

/**
 * MapLibre color palette for RiskLevels
 */
export function getUnifiedSeverityColor(severity: RiskLevel): string {
  switch (severity) {
    case "CRITICAL":
      return "#dc2626"; // red-600
    case "HIGH":
      return "#ea580c"; // orange-600
    case "MODERATE":
      return "#eab308"; // yellow-500
    case "GUARDED":
      return "#0284c7"; // sky-600
    case "LOW":
    default:
      return "#10b981"; // emerald-500
  }
}

/**
 * Severe weather hazard detection thresholds from Open-Meteo telemetry
 */
export const SEVERE_WEATHER_THRESHOLDS = {
  heavyRainMm: 25.0, // mm/hr
  moderateRainMm: 12.0,
  highWindGustsKmh: 60.0, // km/h
  moderateWindGustsKmh: 45.0,
  extremeHeatTempC: 42.0, // deg C
  extremeColdTempC: 4.0,
} as const;
