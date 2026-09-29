import type { LngLat } from "../types/map";
import type { GeoJsonFeature } from "./geojson-helper";

/**
 * Creates a GeoJSON Polygon representing a GPS accuracy buffer circle in meters
 */
export function createAccuracyCircleGeoJson(
  center: LngLat,
  accuracyMeters: number = 100,
  points: number = 48
): GeoJsonFeature {
  const [centerLng, centerLat] = center;
  const radiusKm = Math.max(accuracyMeters / 1000, 0.05); // Minimum 50m radius for visual clarity

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
      id: "user-accuracy-buffer",
      title: `GPS Accuracy (±${Math.round(accuracyMeters)}m)`,
      category: "user_location",
      severity: "LOW",
    },
  };
}
