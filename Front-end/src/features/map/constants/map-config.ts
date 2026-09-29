import type { LngLat, BoundingBox, RegionPreset } from "../types/map";

/**
 * Standard Coordinates and Center Points
 */
export const DEFAULT_MAP_CENTER: LngLat = [72.8777, 19.0760]; // Mumbai Metropolitan (Lon, Lat)
export const DEFAULT_MAP_ZOOM = 10.5;
export const DEFAULT_MAP_MIN_ZOOM = 3;
export const DEFAULT_MAP_MAX_ZOOM = 19;

/**
 * Bounds for Pan and Viewport Constraints
 */
export const INDIA_BOUNDS: BoundingBox = [68.1, 6.7, 97.4, 37.1];
export const MAHARASHTRA_BOUNDS: BoundingBox = [72.6, 15.6, 80.9, 22.0];
export const MUMBAI_BOUNDS: BoundingBox = [72.7, 18.8, 73.1, 19.3];

/**
 * Verified Geographic Region Presets for Rapid Triage and Surveillance
 */
export const REGION_PRESETS: RegionPreset[] = [
  {
    id: "mumbai",
    name: "Mumbai Metropolitan",
    category: "city",
    center: [72.8777, 19.0760],
    zoom: 11,
    description: "High-density coastal urban area prone to monsoon waterlogging and tidal surges.",
    bounds: MUMBAI_BOUNDS,
  },
  {
    id: "maharashtra",
    name: "Maharashtra State",
    category: "state",
    center: [75.7139, 19.7515],
    zoom: 6.8,
    description: "State-wide surveillance spanning Western Ghats, Marathwada, and Konkan coast.",
    bounds: MAHARASHTRA_BOUNDS,
  },
  {
    id: "national",
    name: "India (National View)",
    category: "national",
    center: [78.9629, 20.5937],
    zoom: 4.6,
    description: "Comprehensive multi-hazard overview across all Indian states and Union Territories.",
    bounds: INDIA_BOUNDS,
  },
  {
    id: "himalayan-belt",
    name: "Himalayan Seismic Belt",
    category: "hazard_zone",
    center: [77.5, 31.0],
    zoom: 6.5,
    description: "Zone V seismic risk area susceptible to tectonic shifts, landslides, and flash floods.",
  },
  {
    id: "bay-of-bengal",
    name: "Eastern Coastal Cyclone Belt",
    category: "hazard_zone",
    center: [85.8, 19.8],
    zoom: 6.2,
    description: "Odisha and Andhra coastal belts prone to tropical cyclones and coastal inundation.",
  },
];

/**
 * OpenStreetMap Standard Tile Style (No API Key Required)
 */
export const OSM_RASTER_STYLE = {
  version: 8 as const,
  sources: {
    "osm-tiles": {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster" as const,
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/**
 * CartoDB Voyager Tile Style (Crisp Modern Basemap with OSM Provenance)
 */
export const CARTO_VOYAGER_STYLE = {
  version: 8 as const,
  sources: {
    "carto-voyager": {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "carto-voyager-layer",
      type: "raster" as const,
      source: "carto-voyager",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

/**
 * CartoDB Dark Matter Tile Style (High Contrast Night/Emergency Mode)
 */
export const CARTO_DARK_STYLE = {
  version: 8 as const,
  sources: {
    "carto-dark": {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster" as const,
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const MAP_THEMES = {
  osm: OSM_RASTER_STYLE,
  voyager: CARTO_VOYAGER_STYLE,
  dark: CARTO_DARK_STYLE,
} as const;

export type MapThemeKey = keyof typeof MAP_THEMES;
