import type {
  Map as MapLibreMap,
  GeoJSONSource,
  GeoJSONSourceSpecification,
  ExpressionSpecification,
} from "maplibre-gl";
import type { GeoJsonFeatureCollection } from "./geojson-helper";
import {
  MAP_SOURCES,
  MAP_LAYERS,
  DEFAULT_CLUSTER_CONFIG,
} from "../constants/map-layers";
import {
  getSeverityColorExpression,
  getHazardRadiusExpression,
  getClusterColorExpression,
  getClusterRadiusExpression,
  getHeatmapColorRamp,
} from "./style-expressions";

/**
 * Safely adds or updates a GeoJSON source on the map
 */
export function addOrUpdateGeoJsonSource(
  map: MapLibreMap,
  sourceId: string,
  data: GeoJsonFeatureCollection | GeoJSONSourceSpecification["data"],
  options: { cluster?: boolean; clusterRadius?: number; clusterMaxZoom?: number } = {}
): void {
  if (!map || !map.isStyleLoaded()) return;

  const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(data as GeoJSON.GeoJSON);
  } else {
    map.addSource(sourceId, {
      type: "geojson",
      data: data as GeoJSON.GeoJSON,
      cluster: options.cluster ?? false,
      clusterRadius: options.clusterRadius ?? DEFAULT_CLUSTER_CONFIG.clusterRadius,
      clusterMaxZoom: options.clusterMaxZoom ?? DEFAULT_CLUSTER_CONFIG.clusterMaxZoom,
    });
  }
}

/**
 * Configures standard hazard point circle and symbol layers
 */
export function addHazardPointLayers(
  map: MapLibreMap,
  sourceId: string = MAP_SOURCES.HAZARDS_POINT
): void {
  if (!map || !map.isStyleLoaded()) return;

  // Outer glowing pulse halo for high/critical events
  if (!map.getLayer(MAP_LAYERS.HAZARD_PULSE)) {
    map.addLayer({
      id: MAP_LAYERS.HAZARD_PULSE,
      type: "circle",
      source: sourceId,
      filter: ["in", ["get", "severity"], ["literal", ["HIGH", "CRITICAL"]]],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          10,
          8,
          16,
          14,
          24,
        ] as ExpressionSpecification,
        "circle-color": getSeverityColorExpression(),
        "circle-opacity": 0.25,
        "circle-blur": 0.6,
      },
    });
  }

  // Core circle point layer
  if (!map.getLayer(MAP_LAYERS.HAZARD_CIRCLES)) {
    map.addLayer({
      id: MAP_LAYERS.HAZARD_CIRCLES,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-radius": getHazardRadiusExpression(8),
        "circle-color": getSeverityColorExpression(),
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.95,
      },
    });
  }
}

/**
 * Configures cluster circles and count numbers for clustered sources
 */
export function addClusterLayers(
  map: MapLibreMap,
  sourceId: string = MAP_SOURCES.HAZARDS_CLUSTER
): void {
  if (!map || !map.isStyleLoaded()) return;

  // 1. Cluster circles
  if (!map.getLayer(MAP_LAYERS.CLUSTERS)) {
    map.addLayer({
      id: MAP_LAYERS.CLUSTERS,
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": getClusterColorExpression(DEFAULT_CLUSTER_CONFIG.colorSteps),
        "circle-radius": getClusterRadiusExpression(DEFAULT_CLUSTER_CONFIG.colorSteps),
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.85,
      },
    });
  }

  // 2. Cluster text counts
  if (!map.getLayer(MAP_LAYERS.CLUSTER_COUNT)) {
    map.addLayer({
      id: MAP_LAYERS.CLUSTER_COUNT,
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      },
      paint: {
        "text-color": "#ffffff",
      },
    });
  }

  // 3. Unclustered single points
  if (!map.getLayer(MAP_LAYERS.UNCLUSTERED_POINTS)) {
    map.addLayer({
      id: MAP_LAYERS.UNCLUSTERED_POINTS,
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": getSeverityColorExpression(),
        "circle-radius": getHazardRadiusExpression(7),
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

/**
 * Configures a density heatmap layer
 */
export function addHeatmapLayer(
  map: MapLibreMap,
  sourceId: string = MAP_SOURCES.HAZARDS_POINT
): void {
  if (!map || !map.isStyleLoaded()) return;

  if (!map.getLayer(MAP_LAYERS.HAZARD_HEATMAP)) {
    map.addLayer(
      {
        id: MAP_LAYERS.HAZARD_HEATMAP,
        type: "heatmap",
        source: sourceId,
        maxzoom: 15,
        layout: {
          visibility: "none", // Hidden by default
        },
        paint: {
          // Weight points by magnitude if available, else 1
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "magnitude"], 1],
            0,
            0,
            6,
            1,
          ] as ExpressionSpecification,
          // Increase intensity with zoom
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            9,
            3,
          ] as ExpressionSpecification,
          // Smooth color gradient ramp
          "heatmap-color": getHeatmapColorRamp(),
          // Increase radius with zoom level
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            2,
            9,
            20,
          ] as ExpressionSpecification,
          "heatmap-opacity": 0.75,
        },
      },
      // Place heatmap below point markers if they exist
      map.getLayer(MAP_LAYERS.HAZARD_CIRCLES) ? MAP_LAYERS.HAZARD_CIRCLES : undefined
    );
  }
}

/**
 * Toggles visibility of any layer safely
 */
export function setLayerVisibility(
  map: MapLibreMap,
  layerId: string,
  visible: boolean
): void {
  if (!map || !map.isStyleLoaded() || !map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
}

/**
 * Safely removes a layer if it exists
 */
export function removeLayerSafely(map: MapLibreMap, layerId: string): void {
  if (!map || !map.isStyleLoaded()) return;
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

/**
 * Safely removes a source if it exists
 */
export function removeSourceSafely(map: MapLibreMap, sourceId: string): void {
  if (!map || !map.isStyleLoaded()) return;
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}
