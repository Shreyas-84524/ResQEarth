import type { RiskLevel } from "@/types";
import type { CanonicalDisasterType } from "./disaster-event";
export type { CanonicalDisasterType };

export type GlobalDisasterCategory =
  | "all"
  | "wildfires"
  | "severeStorms"
  | "volcanoes"
  | "floods"
  | "landslides"
  | "seaLakeIce"
  | "tempExtremes"
  | "earthquakes"
  | "waterColor"
  | "other";

// 1. Raw NASA EONET v3 Schema Types
export interface EonetRawCategory {
  id: string;
  title: string;
}

export interface EonetRawSource {
  id: string;
  url: string;
}

export interface EonetRawGeometryItem {
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
  date: string;
  type: "Point" | "Polygon" | "LineString" | string;
  coordinates: number[] | number[][] | number[][][] | unknown; // [lon, lat] or [[lon, lat], ...] or [[[lon, lat], ...]]
}

export interface EonetRawEventProperties {
  id: string;
  title: string;
  description?: string | null;
  link: string;
  closed?: string | null;
  categories: EonetRawCategory[];
  sources: EonetRawSource[];
  date?: string;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
}

export interface EonetGeoJsonFeature {
  type: "Feature";
  id: string;
  properties: EonetRawEventProperties;
  geometry: {
    type: "Point" | "Polygon" | "LineString" | string;
    coordinates: number[] | number[][] | number[][][] | unknown;
  } | null;
}

export interface EonetGeoJsonResponse {
  type: "FeatureCollection";
  title?: string;
  description?: string;
  link?: string;
  events?: EonetRawEvent[];
  features?: EonetGeoJsonFeature[];
}

export interface EonetRawEvent {
  id: string;
  title: string;
  description?: string | null;
  link: string;
  closed?: string | null;
  categories: EonetRawCategory[];
  sources: EonetRawSource[];
  geometry: EonetRawGeometryItem[];
}

export interface EonetEventsResponse {
  title?: string;
  description?: string;
  link?: string;
  events: EonetRawEvent[];
}

// 2. Normalized Global Disaster Event Model
export interface NormalizedGlobalDisaster {
  id: string;
  provider: "nasa-eonet";
  providerEventId: string;
  disasterType: CanonicalDisasterType;
  categoryKey: GlobalDisasterCategory;
  categoryTitle: string;
  title: string;
  description?: string;
  geometryType: "Point" | "Polygon" | "LineString";
  latitude: number;
  longitude: number;
  coordinates: [number, number]; // [lon, lat] centroid
  occurredAt: string;
  updatedAt: string;
  closedAt?: string | null;
  isOpen: boolean;
  sources: Array<{ id: string; url: string }>;
  primarySource: { name: string; url: string };
  sourceUrl: string;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
  severity: RiskLevel;
  severityScale: string;
  distanceKm?: number;
  isStale: boolean;
}

// 3. Filter and Query Options
export interface GlobalDisasterFilterOptions {
  category?: GlobalDisasterCategory;
  status?: "open" | "all";
  days?: number;
  searchQuery?: string;
  maxDistanceKm?: number;
  minSeverity?: RiskLevel;
}

export interface GlobalDisasterFetchOptions {
  category?: GlobalDisasterCategory;
  status?: "open" | "all";
  days?: number;
  userLat?: number;
  userLon?: number;
  forceRefresh?: boolean;
  signal?: AbortSignal;
}

// 4. MapLibre GeoJSON Types
export interface GlobalDisasterGeoJsonProperties {
  id: string;
  title: string;
  disasterType: CanonicalDisasterType;
  categoryKey: GlobalDisasterCategory;
  categoryTitle: string;
  severity: RiskLevel;
  markerRadius: number;
  distanceKm?: number;
  isOpen: boolean;
  occurredAt: string;
  source: string;
  sourceUrl: string;
  category: "global-disaster";
}

export interface GlobalDisasterGeoJsonFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: GlobalDisasterGeoJsonProperties;
}
