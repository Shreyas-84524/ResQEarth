import type { RiskLevel } from "@/types";

export type DisasterProvider =
  | "usgs"
  | "nasa-eonet"
  | "open-meteo"
  | "ndma-sachet"
  | "imd";

export type DisasterSourceType = "official" | "automatic" | "manual-admin";

export type CanonicalDisasterType =
  | "earthquake"
  | "wildfire"
  | "cyclone"
  | "severe-storm"
  | "flood"
  | "urban-flood"
  | "volcano"
  | "landslide"
  | "heat-wave"
  | "cold-wave"
  | "extreme-temperature"
  | "chemical-leak"
  | "heavy-rain"
  | "high-wind"
  | "tsunami"
  | "drought"
  | "other";

export type UnifiedDisasterCategory =
  | "all"
  | "earthquakes"
  | "wildfires"
  | "severeStorms"
  | "volcanoes"
  | "floods"
  | "landslides"
  | "weatherAlerts"
  | "officialAlerts";

export type DisasterTimeWindow = "1h" | "24h" | "48h" | "7d" | "all";

/**
 * Canonical Unified Disaster Event Model across USGS, NASA EONET, Open-Meteo, NDMA SACHET, and IMD
 */
export interface UnifiedDisasterEvent {
  id: string;
  provider: DisasterProvider;
  providerEventId: string;
  disasterType: CanonicalDisasterType;
  categoryKey: UnifiedDisasterCategory;
  categoryTitle: string;
  title: string;
  description?: string;
  severity: RiskLevel;
  severityScale: string;
  sourceType: DisasterSourceType;
  sourceName: string;
  sourceUrl: string;
  isOfficialAlert: boolean;
  isMappable: boolean; // True when valid coordinates exist for map rendering
  latitude?: number;
  longitude?: number;
  coordinates?: [number, number]; // [longitude, latitude] in WGS84 when mappable
  geometryType?: "Point" | "Polygon" | "LineString";
  region: string;
  occurredAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  expiresAt?: string | null;
  isOpen: boolean;
  distanceKm?: number;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
  depthKm?: number | null;
  tsunamiAlert?: boolean;
  isStale?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Metric summary tracking mappable vs missing-coordinate hazard counts
 */
export interface DisasterMappingStats {
  total: number;
  mappable: number;
  missingCoordinates: number;
}

/**
 * Filter options for Unified Disaster Event queries
 */
export interface UnifiedDisasterFilterOptions {
  category?: UnifiedDisasterCategory;
  provider?: DisasterProvider | "all";
  sourceType?: DisasterSourceType | "all";
  minSeverity?: RiskLevel | "all";
  timeWindow?: DisasterTimeWindow;
  maxDistanceKm?: number;
  searchQuery?: string;
  officialOnly?: boolean;
  status?: "open" | "all";
}

/**
 * Fetch options for Unified Disaster service
 */
export interface UnifiedDisasterFetchOptions {
  userLat?: number;
  userLon?: number;
  forceRefresh?: boolean;
  signal?: AbortSignal;
}

/**
 * MapLibre GeoJSON feature properties for Unified Hazards Layer
 */
export interface UnifiedDisasterGeoJsonProperties {
  id: string;
  title: string;
  disasterType: CanonicalDisasterType;
  categoryKey: UnifiedDisasterCategory;
  categoryTitle: string;
  severity: RiskLevel;
  provider: DisasterProvider;
  sourceType: DisasterSourceType;
  sourceName: string;
  sourceUrl: string;
  isOfficialAlert: boolean;
  markerRadius: number;
  distanceKm?: number;
  isOpen: boolean;
  occurredAt: string;
  region: string;
  category: "unified-disaster";
}

export interface UnifiedDisasterGeoJsonFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: UnifiedDisasterGeoJsonProperties;
}

/**
 * Raw Indian Official Alert Model (NDMA SACHET / IMD CAP Schema)
 */
export interface IndianOfficialAlertRaw {
  identifier: string;
  sender: string;
  sent: string;
  status: "Actual" | "Exercise" | "Test" | "Draft";
  msgType: "Alert" | "Update" | "Cancel";
  scope: "Public" | "Restricted";
  category: string;
  event: string;
  urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  certainty: "Observed" | "Likely" | "Possible" | "Unlikely" | "Unknown";
  headline: string;
  description: string;
  instruction?: string;
  web?: string;
  contact?: string;
  areaDesc: string;
  circle?: string; // "lat,lon,radius_km"
  polygon?: string; // "lat,lon lat,lon ..."
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  effective?: string;
  expires?: string;
}
