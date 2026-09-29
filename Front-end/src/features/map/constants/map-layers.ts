import type { DisasterCategory, SeverityLevel, MapLayerState } from "../types/map";

/**
 * Standard Map Source IDs
 */
export const MAP_SOURCES = {
  HAZARDS_POINT: "resqearth-hazards-point-source",
  HAZARDS_CLUSTER: "resqearth-hazards-cluster-source",
  EARTHQUAKES: "resqearth-earthquakes-source",
  FLOOD_ZONES: "resqearth-flood-zones-source",
  WEATHER_RADAR: "resqearth-weather-radar-source",
  HEATMAP_DENSITY: "resqearth-hazard-heatmap-source",
  USER_LOCATION: "resqearth-user-location-source",
} as const;

/**
 * Standard Map Layer IDs
 */
export const MAP_LAYERS = {
  // Base Hazard Points
  HAZARD_CIRCLES: "resqearth-hazard-circles-layer",
  HAZARD_SYMBOLS: "resqearth-hazard-symbols-layer",
  HAZARD_PULSE: "resqearth-hazard-pulse-layer",

  // Clustering Layers
  CLUSTERS: "resqearth-clusters-layer",
  CLUSTER_COUNT: "resqearth-cluster-count-layer",
  UNCLUSTERED_POINTS: "resqearth-unclustered-points-layer",

  // Heatmap Layers
  HAZARD_HEATMAP: "resqearth-hazard-heatmap-layer",

  // Flood Inundation & Line Layers
  FLOOD_AREAS: "resqearth-flood-areas-fill-layer",
  FLOOD_OUTLINES: "resqearth-flood-areas-outline-layer",

  // User Location
  USER_LOCATION_DOT: "resqearth-user-location-dot",
  USER_LOCATION_ACCURACY: "resqearth-user-location-accuracy",
} as const;

/**
 * Severity Color Scale (Hex Codes aligned with ResQEarth Design System)
 */
export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  LOW: "#16a34a",       // Emerald Green (0-20)
  GUARDED: "#0284c7",   // Sky Blue (21-40)
  MODERATE: "#f59e0b",  // Amber (41-60)
  HIGH: "#ea580c",      // Orange (61-80)
  CRITICAL: "#dc2626",  // Crimson Red (81-100)
};

/**
 * Disaster Category Colors
 */
export const CATEGORY_COLORS: Record<DisasterCategory, string> = {
  all: "#3b82f6",
  flood: "#0284c7",
  cyclone: "#0d9488",
  earthquake: "#ef4444",
  wildfire: "#f97316",
  landslide: "#854d0e",
  chemical: "#a855f7",
  weather: "#06b6d4",
};

/**
 * Default Interactive Layer Catalog
 */
export const DEFAULT_LAYER_CATALOG: MapLayerState[] = [
  {
    id: "layer-earthquakes",
    name: "Earthquakes (USGS)",
    category: "earthquake",
    visible: true,
    color: CATEGORY_COLORS.earthquake,
    description: "Real-time seismic activity with magnitude-scaled circles.",
  },
  {
    id: "layer-floods",
    name: "Flood & Inundation",
    category: "flood",
    visible: true,
    color: CATEGORY_COLORS.flood,
    description: "River discharge overflow indicators and waterlogged zones.",
  },
  {
    id: "layer-cyclones",
    name: "Cyclones & High Winds",
    category: "cyclone",
    visible: true,
    color: CATEGORY_COLORS.cyclone,
    description: "Tropical storm tracks, wind gust alerts, and coastal storm surges.",
  },
  {
    id: "layer-wildfires",
    name: "Wildfires & Heat Alerts",
    category: "wildfire",
    visible: true,
    color: CATEGORY_COLORS.wildfire,
    description: "Thermal anomaly detections and extreme heat warnings.",
  },
  {
    id: "layer-clusters",
    name: "Event Clustering",
    category: "all",
    visible: true,
    color: "#3b82f6",
    description: "Group dense regional hazard points into interactive count clusters.",
  },
  {
    id: "layer-heatmap",
    name: "Hazard Density Heatmap",
    category: "all",
    visible: false,
    color: "#ef4444",
    description: "Smooth continuous density gradient highlighting concentration of active events.",
  },
];

/**
 * Cluster Configuration Presets
 */
export const DEFAULT_CLUSTER_CONFIG = {
  clusterRadius: 50,
  clusterMaxZoom: 14,
  clusterMinPoints: 2,
  colorSteps: [
    { count: 10, color: "#3b82f6", radius: 18 },
    { count: 25, color: "#f59e0b", radius: 24 },
    { count: 50, color: "#ea580c", radius: 30 },
    { count: 100, color: "#dc2626", radius: 36 },
  ],
};
