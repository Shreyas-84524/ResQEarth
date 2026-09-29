import type { LngLat, BoundingBox } from "../types/map";

export interface GeoJsonPointProperties {
  id: string;
  title: string;
  category: string;
  severity: string;
  provenance?: string;
  magnitude?: number;
  occurredAt?: string;
  description?: string;
  sourceName?: string;
  guideSlug?: string;
  [key: string]: unknown;
}

export interface GeoJsonFeature<P = GeoJsonPointProperties> {
  type: "Feature";
  id?: string | number;
  geometry: {
    type: "Point" | "Polygon" | "LineString";
    coordinates: number[] | number[][] | number[][][];
  };
  properties: P;
}

export interface GeoJsonFeatureCollection<P = GeoJsonPointProperties> {
  type: "FeatureCollection";
  features: GeoJsonFeature<P>[];
}

/**
 * Validates if coordinates are within standard WGS84 geographic limits
 */
export function isValidCoordinate(lng: number, lat: number): boolean {
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Creates an empty GeoJSON FeatureCollection
 */
export function createEmptyFeatureCollection<P = GeoJsonPointProperties>(): GeoJsonFeatureCollection<P> {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

/**
 * Converts a list of point items into a valid GeoJSON FeatureCollection
 */
export function pointsToFeatureCollection<
  T extends {
    id: string;
    longitude: number;
    latitude: number;
    title?: string;
    category?: string;
    disasterType?: string;
    severity?: string;
    provenance?: string;
    sourceType?: string;
    occurredAt?: string;
    description?: string;
    sourceName?: string;
    slug?: string;
    guideSlug?: string;
  },
>(
  items: T[],
  propertiesMapper?: (item: T) => GeoJsonPointProperties
): GeoJsonFeatureCollection {
  const features: GeoJsonFeature[] = [];

  for (const item of items) {
    if (!isValidCoordinate(item.longitude, item.latitude)) {
      continue;
    }

    const properties: GeoJsonPointProperties = propertiesMapper
      ? propertiesMapper(item)
      : {
          id: item.id,
          title: item.title || "Hazard Event",
          category: item.category || item.disasterType || "general",
          severity: item.severity || "MODERATE",
          provenance: item.provenance || item.sourceType || "official",
          occurredAt: item.occurredAt,
          description: item.description,
          sourceName: item.sourceName,
          guideSlug: item.slug || item.guideSlug,
        };

    features.push({
      type: "Feature",
      id: item.id,
      geometry: {
        type: "Point",
        coordinates: [item.longitude, item.latitude],
      },
      properties,
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Computes bounding box [minLng, minLat, maxLng, maxLat] from a list of coordinates
 */
export function computeBoundingBox(coordinates: LngLat[]): BoundingBox | null {
  if (!coordinates || coordinates.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of coordinates) {
    if (!isValidCoordinate(lng, lat)) continue;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  if (minLng === Infinity || minLat === Infinity) return null;

  return [minLng, minLat, maxLng, maxLat];
}

type PointLike =
  | LngLat
  | { lng: number; lat: number }
  | { longitude: number; latitude: number };

function extractLngLat(p: PointLike): [number, number] {
  if (Array.isArray(p)) return [p[0], p[1]];
  if ("lng" in p && "lat" in p) return [p.lng, p.lat];
  if ("longitude" in p && "latitude" in p) return [p.longitude, p.latitude];
  return [0, 0];
}

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  point1: PointLike,
  point2: PointLike
): number {
  const [lng1, lat1] = extractLngLat(point1);
  const [lng2, lat2] = extractLngLat(point2);

  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Generates a GeoJSON Polygon circle approximating a buffer zone around a coordinate
 */
export function createCirclePolygonGeoJson(
  center: LngLat,
  radiusKm: number,
  points: number = 64
): GeoJsonFeature {
  const [centerLng, centerLat] = center;
  const coordinates: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coordinates.push([centerLng + x, centerLat + y]);
  }
  // Close the loop
  coordinates.push(coordinates[0]);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
    properties: {
      id: "radius-circle",
      title: `${radiusKm} km Buffer`,
      category: "buffer",
      severity: "LOW",
    },
  };
}
