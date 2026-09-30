/**
 * MapTiler API Configuration and Service
 * Centralizes MapTiler API key resolution, validation, style URL generation,
 * attribution, and graceful error handling for MapLibre GL JS.
 */

export const MAPTILER_API_KEY_ENV_NAME = "NEXT_PUBLIC_MAPTILER_API_KEY";

export type MapTilerStyleId =
  | "outdoor-v2"
  | "streets-v2"
  | "dataviz"
  | "dataviz-dark"
  | "hybrid";

/**
 * Default style suitable for ResQEarth:
 * 'outdoor-v2' highlights topography, contours, waterways, and natural terrain,
 * making it ideal for environmental surveillance, flood, and disaster management.
 */
export const DEFAULT_MAPTILER_STYLE: MapTilerStyleId = "outdoor-v2";

export interface MapTilerStyleInfo {
  id: MapTilerStyleId;
  name: string;
  description: string;
}

export const MAPTILER_STYLE_PRESETS: Record<MapTilerStyleId, MapTilerStyleInfo> = {
  "outdoor-v2": {
    id: "outdoor-v2",
    name: "Outdoor / Topography",
    description:
      "Elevation contours, hillshading, waterways, and vegetation suitable for disaster monitoring and environmental science.",
  },
  "streets-v2": {
    id: "streets-v2",
    name: "Streets",
    description: "Detailed street network, road hierarchy, and administrative boundaries.",
  },
  "dataviz": {
    id: "dataviz",
    name: "Data Visualization Light",
    description:
      "Clean, uncluttered basemap designed for multi-hazard overlays, heatmaps, and markers.",
  },
  "dataviz-dark": {
    id: "dataviz-dark",
    name: "Data Visualization Dark",
    description:
      "High-contrast dark mode for emergency operations and nocturnal surveillance.",
  },
  "hybrid": {
    id: "hybrid",
    name: "Satellite Hybrid",
    description:
      "High-resolution satellite imagery with street, border, and place name overlays.",
  },
};

export const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

export const MAPTILER_CONFIG_ERROR_MESSAGE =
  "Map configuration error: MapTiler API key is missing. Please set NEXT_PUBLIC_MAPTILER_API_KEY in your .env.local file to load the vector basemap.";

/**
 * Safely retrieves the MapTiler API key from the environment.
 */
export function getMapTilerApiKey(): string {
  if (typeof process === "undefined" || !process.env) return "";
  const key = process.env[MAPTILER_API_KEY_ENV_NAME];
  if (!key || typeof key !== "string") return "";
  return key.trim();
}

/**
 * Validates whether the MapTiler API key is configured and valid.
 * Protects against empty strings, placeholders, or whitespace-only keys.
 */
export function isMapTilerKeyConfigured(): boolean {
  const key = getMapTilerApiKey();
  if (!key) return false;

  const placeholderPatterns = [
    "your_key",
    "your-key",
    "placeholder",
    "maptiler_key",
    "api_key",
    "todo",
    "changeme",
  ];
  const lower = key.toLowerCase();
  if (placeholderPatterns.some((pattern) => lower.includes(pattern))) {
    return false;
  }

  // Valid MapTiler keys are alphanumeric strings of at least 8 characters
  return key.length >= 8;
}

/**
 * Generates the full MapTiler style JSON endpoint URL.
 * Returns null if the API key is missing, preventing unauthorized tile requests
 * and avoiding broken tiles or "API KEY REQUIRED" watermarks.
 */
export function getMapTilerStyleUrl(
  styleId: MapTilerStyleId = DEFAULT_MAPTILER_STYLE
): string | null {
  if (!isMapTilerKeyConfigured()) {
    return null;
  }
  const key = getMapTilerApiKey();
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${key}`;
}
