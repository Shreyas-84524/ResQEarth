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

  const sourceId = "resqearth-unified-hazards";
  const heatmapLayerId = "resqearth-unified-heatmap";
  const circleLayerId = "resqearth-unified-circles";
  const pulseLayerId = "resqearth-unified-pulse";
  const officialRingLayerId = "resqearth-unified-official-ring";
  const selectedHaloLayerId = "resqearth-unified-selected-halo";
  const labelLayerId = "resqearth-unified-labels";

  // Fresh refs to prevent stale closures and avoid recreating listeners on every disaster change
  const disastersRef = React.useRef(disasters);
  disastersRef.current = disasters;

  const onSelectDisasterRef = React.useRef(onSelectDisaster);
  onSelectDisasterRef.current = onSelectDisaster;

  const geoJsonRef = React.useRef(geoJson);
  geoJsonRef.current = geoJson;

  const prevSelectedIdRef = React.useRef<string | null>(null);

  // 1. Idempotent initialization of MapLibre source and layers
  const setupSourceAndLayers = React.useCallback(() => {
    if (!map || !map.isStyleLoaded()) return;

    // 1a. Ensure single GeoJSON source exists
    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (!existingSource) {
      map.addSource(sourceId, {
        type: "geojson",
        data: geoJsonRef.current,
      });
    } else {
      existingSource.setData(geoJsonRef.current);
    }

    // 1b. Multi-Hazard Severity-Weighted Heatmap Layer (Lowest z-index)
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

    // 1c. High-Severity Pulse Ring Layer (for CRITICAL or HIGH events)
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

    // 1d. Official Statutory Alert Outer Ring Layer (NDMA SACHET / IMD)
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

    // 1e. Primary Unified Disaster Point Circle Layer
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

    // 1f. Selected Event Focus / Halo Layer
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

    // 1g. Category Text Labels at closer zoom levels (zoom >= 5)
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
  }, [map, sourceId, heatmapLayerId, pulseLayerId, officialRingLayerId, circleLayerId, selectedHaloLayerId, labelLayerId]);

  // 2. Lifecycle setup: on load and on map style reload (e.g. basemap change)
  React.useEffect(() => {
    if (!map) return;

    if (isLoaded) {
      setupSourceAndLayers();
    }

    map.on("style.load", setupSourceAndLayers);

    return () => {
      map.off("style.load", setupSourceAndLayers);
      const layersToClean = [
        labelLayerId,
        selectedHaloLayerId,
        circleLayerId,
        officialRingLayerId,
        pulseLayerId,
        heatmapLayerId,
      ];
      for (const id of layersToClean) {
        if (map.getLayer(id)) {
          try {
            map.removeLayer(id);
          } catch {
            // ignore during unmount
          }
        }
      }
      if (map.getSource(sourceId)) {
        try {
          map.removeSource(sourceId);
        } catch {
          // ignore during unmount
        }
      }
    };
  }, [map, isLoaded, setupSourceAndLayers, sourceId, labelLayerId, selectedHaloLayerId, circleLayerId, officialRingLayerId, pulseLayerId, heatmapLayerId]);

  // 3. Update GeoJSON source data reactively
  React.useEffect(() => {
    geoJsonRef.current = geoJson;
    if (!map || !isLoaded || !map.isStyleLoaded()) return;

    const src = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(geoJson);
    }
  }, [map, isLoaded, geoJson, sourceId]);

  // 4. Update display modes: Hybrid ("all"), Markers Only ("markers"), Heatmap Only ("heatmap")
  React.useEffect(() => {
    if (!map || !isLoaded || !map.isStyleLoaded()) return;

    const isOverallVisible = visible;
    const showHeatmap = isOverallVisible && (displayMode === "all" || displayMode === "heatmap");
    const showMarkers = isOverallVisible && (displayMode === "all" || displayMode === "markers");

    const heatmapVis = showHeatmap ? "visible" : "none";
    const markersVis = showMarkers ? "visible" : "none";

    if (map.getLayer(heatmapLayerId)) {
      map.setLayoutProperty(heatmapLayerId, "visibility", heatmapVis);
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

  // 5. Update selected event focus halo filter
  React.useEffect(() => {
    if (!map || !isLoaded || !map.isStyleLoaded() || !map.getLayer(selectedHaloLayerId)) return;
    const selectedId = selectedDisaster ? selectedDisaster.id : "";
    map.setFilter(selectedHaloLayerId, ["==", ["get", "id"], selectedId]);
  }, [map, isLoaded, selectedDisaster, selectedHaloLayerId]);

  // 6. Feed-to-map navigation: flyTo selected hazard and focus view
  React.useEffect(() => {
    if (!map || !selectedDisaster) {
      prevSelectedIdRef.current = null;
      return;
    }

    if (selectedDisaster.id !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedDisaster.id;
      if (
        selectedDisaster.isMappable &&
        typeof selectedDisaster.longitude === "number" &&
        typeof selectedDisaster.latitude === "number"
      ) {
        map.flyTo({
          center: [selectedDisaster.longitude, selectedDisaster.latitude],
          zoom: Math.max(map.getZoom(), 7),
          essential: true,
          duration: 1200,
        });
      }
    }
  }, [map, selectedDisaster]);

  // 7. Click and hover interactions on hazard marker layers
  React.useEffect(() => {
    if (!map || !isLoaded) return;

    const interactiveLayers = [circleLayerId, pulseLayerId, officialRingLayerId];

    const handleClick = (e: { features?: MapGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;
      const feat = e.features[0];
      const clickedId = feat.properties?.id;
      const match = disastersRef.current.find((d) => d.id === clickedId);
      if (match) {
        onSelectDisasterRef.current?.(match);
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    for (const layerId of interactiveLayers) {
      map.on("click", layerId, handleClick);
      map.on("mouseenter", layerId, handleMouseEnter);
      map.on("mouseleave", layerId, handleMouseLeave);
    }

    return () => {
      if (map) {
        for (const layerId of interactiveLayers) {
          map.off("click", layerId, handleClick);
          map.off("mouseenter", layerId, handleMouseEnter);
          map.off("mouseleave", layerId, handleMouseLeave);
        }
      }
    };
  }, [map, isLoaded, circleLayerId, pulseLayerId, officialRingLayerId]);

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
