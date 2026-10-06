"use client";

import * as React from "react";
import type { MapGeoJSONFeature } from "maplibre-gl";
import type maplibregl from "maplibre-gl";
import { useMap } from "@/features/map/hooks/use-map";
import {
  getSeverityColorExpression,
  getHeatmapColorRamp,
  getSeverityHeatmapWeightExpression,
  getHeatmapIntensityExpression,
  getHeatmapRadiusExpression,
  getHeatmapOpacityExpression,
} from "@/features/map/services/style-expressions";
import type { UnifiedDisasterEvent } from "../types/disaster-event";
import { UnifiedDisasterPopup } from "./unified-disaster-popup";

export type MapGisDisplayMode = "all" | "markers" | "heatmap";

export interface MapUnifiedDisasterLayerProps {
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Point>;
  disasters: UnifiedDisasterEvent[];
  selectedDisaster: UnifiedDisasterEvent | null;
  onSelectDisaster: (disaster: UnifiedDisasterEvent | null) => void;
  displayMode?: MapGisDisplayMode;
  visible?: boolean;
}

export function MapUnifiedDisasterLayer({
  geoJson,
  disasters,
  selectedDisaster,
  onSelectDisaster,
  displayMode = "all",
  visible = true,
}: MapUnifiedDisasterLayerProps) {
  const { map, isLoaded } = useMap();

  const sourceId = "resqearth-source-unified-hazards";
  const heatmapLayerId = "resqearth-unified-hazard-heatmap";
  const circleLayerId = "resqearth-unified-hazard-circles";
  const pulseLayerId = "resqearth-unified-hazard-pulse";
  const officialRingLayerId = "resqearth-unified-official-ring";
  const selectedHaloLayerId = "resqearth-unified-selected-halo";
  const labelLayerId = "resqearth-unified-hazard-labels";

  // 1. Initialize Source and Layers once Map is loaded
  React.useEffect(() => {
    if (!map || !isLoaded) return;

    // Add GeoJSON source if missing
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    // 1a. Multi-Hazard Severity-Weighted Heatmap Layer (Lowest z-index layer)
    if (!map.getLayer(heatmapLayerId)) {
      map.addLayer({
        id: heatmapLayerId,
        type: "heatmap",
        source: sourceId,
        layout: {
          visibility: "visible",
        },
        paint: {
          "heatmap-weight": getSeverityHeatmapWeightExpression(),
          "heatmap-intensity": getHeatmapIntensityExpression(),
          "heatmap-color": getHeatmapColorRamp(),
          "heatmap-radius": getHeatmapRadiusExpression(),
          "heatmap-opacity": getHeatmapOpacityExpression(),
        },
      });
    }

    // 1b. High-Severity Pulse Ring Layer (for CRITICAL or HIGH events)
    if (!map.getLayer(pulseLayerId)) {
      map.addLayer({
        id: pulseLayerId,
        type: "circle",
        source: sourceId,
        filter: ["in", ["get", "severity"], ["literal", ["CRITICAL", "HIGH"]]],
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": "rgba(220, 38, 38, 0.18)",
          "circle-radius": ["*", ["get", "markerRadius"], 1.6],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#dc2626",
          "circle-stroke-opacity": 0.8,
        },
      });
    }

    // 1c. Official Statutory Alert Outer Ring Layer
    if (!map.getLayer(officialRingLayerId)) {
      map.addLayer({
        id: officialRingLayerId,
        type: "circle",
        source: sourceId,
        filter: ["==", ["get", "isOfficialAlert"], true],
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": "transparent",
          "circle-radius": ["+", ["get", "markerRadius"], 3.5],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#f59e0b", // statutory gold ring for official alerts
          "circle-stroke-opacity": 0.95,
        },
      });
    }

    // 1d. Primary Unified Disaster Point Circle Layer
    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: "circle",
        source: sourceId,
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": getSeverityColorExpression("#ea580c"),
          "circle-radius": ["get", "markerRadius"],
          "circle-opacity": 0.9,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // 1e. Selected Event Focus / Halo Layer
    if (!map.getLayer(selectedHaloLayerId)) {
      map.addLayer({
        id: selectedHaloLayerId,
        type: "circle",
        source: sourceId,
        filter: ["==", ["get", "id"], ""],
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": "transparent",
          "circle-radius": ["+", ["get", "markerRadius"], 7],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#06b6d4", // Cyan focus halo
          "circle-stroke-opacity": 1.0,
        },
      });
    }

    // 1f. Category Text Labels at closer zoom levels
    if (!map.getLayer(labelLayerId)) {
      map.addLayer({
        id: labelLayerId,
        type: "symbol",
        source: sourceId,
        minzoom: 5,
        layout: {
          visibility: "visible",
          "text-field": ["to-string", ["get", "categoryTitle"]],
          "text-size": 10,
          "text-offset": [0, 1.2],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        },
      });
    }

    // 2. Click Handler
    const handleClick = (e: { features?: MapGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const clickedId = feat.properties?.id;
      const match = disasters.find((d) => d.id === clickedId);
      if (match) {
        onSelectDisaster(match);
      }
    };

    // 3. Mouse Hover Pointer
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", circleLayerId, handleClick);
    map.on("mouseenter", circleLayerId, handleMouseEnter);
    map.on("mouseleave", circleLayerId, handleMouseLeave);

    return () => {
      if (map) {
        map.off("click", circleLayerId, handleClick);
        map.off("mouseenter", circleLayerId, handleMouseEnter);
        map.off("mouseleave", circleLayerId, handleMouseLeave);
      }
    };
  }, [
    map,
    isLoaded,
    disasters,
    onSelectDisaster,
    sourceId,
    heatmapLayerId,
    circleLayerId,
    pulseLayerId,
    officialRingLayerId,
    selectedHaloLayerId,
    labelLayerId,
  ]);

  // Update GeoJSON source whenever data updates
  React.useEffect(() => {
    if (!map || !isLoaded) return;
    const src = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(geoJson);
    }
  }, [map, isLoaded, geoJson, sourceId]);

  // Update selected event halo filter
  React.useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(selectedHaloLayerId)) return;
    const selectedId = selectedDisaster ? selectedDisaster.id : "";
    map.setFilter(selectedHaloLayerId, ["==", ["get", "id"], selectedId]);
  }, [map, isLoaded, selectedDisaster, selectedHaloLayerId]);

  // Update layer visibility and display modes (all / markers / heatmap)
  React.useEffect(() => {
    if (!map || !isLoaded) return;

    const isOverallVisible = visible;
    const showHeatmap = isOverallVisible && (displayMode === "all" || displayMode === "heatmap");
    const showMarkers = isOverallVisible && (displayMode === "all" || displayMode === "markers");

    const heatmapVis = showHeatmap ? "visible" : "none";
    const markersVis = showMarkers ? "visible" : "none";

    if (map.getLayer(heatmapLayerId)) {
      map.setLayoutProperty(heatmapLayerId, "visibility", heatmapVis);
      // If user explicitly chose "heatmap" mode, keep full opacity across all zooms
      if (displayMode === "heatmap") {
        map.setPaintProperty(heatmapLayerId, "heatmap-opacity", 0.85);
      } else {
        map.setPaintProperty(heatmapLayerId, "heatmap-opacity", getHeatmapOpacityExpression());
      }
    }

    if (map.getLayer(circleLayerId)) map.setLayoutProperty(circleLayerId, "visibility", markersVis);
    if (map.getLayer(pulseLayerId)) map.setLayoutProperty(pulseLayerId, "visibility", markersVis);
    if (map.getLayer(officialRingLayerId)) map.setLayoutProperty(officialRingLayerId, "visibility", markersVis);
    if (map.getLayer(selectedHaloLayerId)) map.setLayoutProperty(selectedHaloLayerId, "visibility", markersVis);
    if (map.getLayer(labelLayerId)) map.setLayoutProperty(labelLayerId, "visibility", markersVis);
  }, [
    map,
    isLoaded,
    visible,
    displayMode,
    heatmapLayerId,
    circleLayerId,
    pulseLayerId,
    officialRingLayerId,
    selectedHaloLayerId,
    labelLayerId,
  ]);

  return (
    <>
      {selectedDisaster && selectedDisaster.isMappable && (
        <UnifiedDisasterPopup
          disaster={selectedDisaster}
          onClose={() => onSelectDisaster(null)}
        />
      )}
    </>
  );
}
