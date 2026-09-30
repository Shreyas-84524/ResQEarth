import type { LngLat, BoundingBox } from "../types/map";
import {
  DEFAULT_MAPTILER_STYLE,
  getMapTilerStyleUrl,
  MAPTILER_ATTRIBUTION,
  isMapTilerKeyConfigured,
  MAPTILER_CONFIG_ERROR_MESSAGE,
} from "../services/maptiler-service";

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
 * OpenStreetMap Standard Tile Style (Fallback reference)
 */
export const OSM_RASTER_STYLE = {
  version: 8 as const,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "osm-tiles": {
      type: "raster" as const,
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: MAPTILER_ATTRIBUTION,
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
 * Default basemap style for MapLibre:
 * Resolves to the centralized MapTiler outdoor-v2 vector style URL.
 */
export const DEFAULT_MAP_STYLE_ID = DEFAULT_MAPTILER_STYLE;

export function getDefaultMapStyleUrl(): string | null {
  return getMapTilerStyleUrl(DEFAULT_MAP_STYLE_ID);
}

export {
  DEFAULT_MAPTILER_STYLE,
  getMapTilerStyleUrl,
  MAPTILER_ATTRIBUTION,
  isMapTilerKeyConfigured,
  MAPTILER_CONFIG_ERROR_MESSAGE,
};
