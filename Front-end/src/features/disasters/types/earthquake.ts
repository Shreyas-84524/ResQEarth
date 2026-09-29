import type { RiskLevel } from "@/types";

export type EarthquakeFeedTimeWindow =
  | "hour"
  | "day_all"
  | "day_2.5"
  | "day_4.5"
  | "day_significant"
  | "week_all";

export interface UsgsEarthquakeProperties {
  mag: number | null;
  place: string | null;
  time: number;
  updated: number;
  tz?: number | null;
  url: string;
  detail?: string;
  felt?: number | null;
  cdi?: number | null;
  mmi?: number | null;
  alert?: string | null;
  status?: string;
  tsunami?: number;
  sig?: number;
  net?: string;
  code?: string;
  ids?: string;
  sources?: string;
  types?: string;
  nst?: number | null;
  dmin?: number | null;
  rms?: number | null;
  gap?: number | null;
  magType?: string;
  type?: string;
  title?: string;
}

export interface UsgsEarthquakeGeometry {
  type: "Point";
  coordinates: [number, number, number]; // [longitude, latitude, depth_km]
}

export interface UsgsEarthquakeFeature {
  type: "Feature";
  id: string;
  properties: UsgsEarthquakeProperties;
  geometry: UsgsEarthquakeGeometry;
}

export interface UsgsEarthquakeFeedResponse {
  type: "FeatureCollection";
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: UsgsEarthquakeFeature[];
}

export interface NormalizedEarthquake {
  id: string;
  provider: "usgs";
  providerEventId: string;
  disasterType: "earthquake";
  title: string;
  place: string;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  occurredAt: string;
  updatedAt: string;
  tsunamiAlert: boolean;
  feltReports?: number;
  significance?: number;
  status: "reviewed" | "automatic" | "unknown";
  magType: string;
  source: string;
  sourceUrl: string;
  detailUrl?: string;
  severity: RiskLevel;
  severityScale: string;
  distanceKm?: number;
  isStale: boolean;
}

export interface EarthquakeFilterOptions {
  minMagnitude?: number;
  maxDistanceKm?: number;
  timeWindow?: EarthquakeFeedTimeWindow;
  searchQuery?: string;
}

export interface EarthquakeGeoJsonFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    place: string;
    magnitude: number;
    depthKm: number;
    occurredAt: string;
    severity: RiskLevel;
    tsunamiAlert: boolean;
    distanceKm?: number;
    sourceUrl: string;
    markerRadius: number;
    category: "earthquake";
  };
}

export interface EarthquakeFetchOptions {
  userLat?: number;
  userLon?: number;
  forceRefresh?: boolean;
  signal?: AbortSignal;
}
