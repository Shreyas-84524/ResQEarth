/**
 * ResQEarth MapLibre GIS Types
 * Comprehensive typed definitions for coordinates, viewports, region presets, layers, and popups.
 */

import type { Map as MapLibreMap } from "maplibre-gl";

export type LngLat = [number, number]; // [longitude, latitude]
export type BoundingBox = [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

export interface MapViewport {
  center: LngLat;
  zoom: number;
  pitch?: number;
  bearing?: number;
  bounds?: BoundingBox;
}

export interface RegionPreset {
  id: string;
  name: string;
  category: "city" | "state" | "national" | "hazard_zone";
  center: LngLat;
  zoom: number;
  description: string;
  bounds?: BoundingBox;
}

export type DisasterCategory =
  | "all"
  | "flood"
  | "cyclone"
  | "earthquake"
  | "wildfire"
  | "landslide"
  | "chemical"
  | "weather";

export type SeverityLevel = "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL";

export type ProvenanceType = "official" | "calculated" | "simulation";

export interface MapPopupData {
  id: string;
  title: string;
  category: DisasterCategory;
  severity: SeverityLevel;
  provenance: ProvenanceType;
  coordinates: LngLat;
  description?: string;
  locationName?: string;
  occurredAt?: string;
  sourceName?: string;
  guideSlug?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface MapClusterConfig {
  sourceId: string;
  clusterRadius?: number;
  clusterMaxZoom?: number;
  clusterMinPoints?: number;
  colorSteps?: Array<{ count: number; color: string; radius: number }>;
}

export interface MapHeatmapConfig {
  sourceId: string;
  layerId: string;
  weightProperty?: string;
  maxZoom?: number;
  radiusStops?: Array<[number, number]>;
  intensityStops?: Array<[number, number]>;
}

export interface MapLayerState {
  id: string;
  name: string;
  category: DisasterCategory;
  visible: boolean;
  count?: number;
  color: string;
  iconName?: string;
  description?: string;
}

export interface MapContextValue {
  map: MapLibreMap | null;
  isLoaded: boolean;
  hasWebGLError: boolean;
  viewport: MapViewport;
  activeRegion: RegionPreset | null;
  activeLayers: Record<string, boolean>;
  selectedFeature: MapPopupData | null;
  flyTo: (center: LngLat, zoom?: number, options?: { pitch?: number; bearing?: number; duration?: number }) => void;
  fitBounds: (bounds: BoundingBox, padding?: number) => void;
  setRegion: (preset: RegionPreset) => void;
  toggleLayer: (layerId: string, visible?: boolean) => void;
  setSelectedFeature: (feature: MapPopupData | null) => void;
  resetView: () => void;
}
