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
import { calculateHaversineDistanceKm } from "@/features/map/services/geojson-helper";
import { MapHazardDetailCard } from "./map-hazard-detail-card";

export type MapGisDisplayMode = "all" | "markers" | "heatmap";

const SEVERITY_WEIGHT: Record<string, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MODERATE: 3,
  GUARDED: 2,
  LOW: 1,
};

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

  const selectedDisasterRef = React.useRef(selectedDisaster);
  selectedDisasterRef.current = selectedDisaster;

  // Identify other overlapping hazards within 35 km of selected event
  const overlappingHazards = React.useMemo(() => {
    if (
      !selectedDisaster ||
      !selectedDisaster.isMappable ||
      typeof selectedDisaster.longitude !== "number" ||
      typeof selectedDisaster.latitude !== "number"
    ) {
      return [];
    }

    const selLon = selectedDisaster.longitude;
    const selLat = selectedDisaster.latitude;

    return disasters.filter((d) => {
      if (
        d.id === selectedDisaster.id ||
        !d.isMappable ||
        typeof d.longitude !== "number" ||
        typeof d.latitude !== "number"
      ) {
        return false;
      }
      const dist = calculateHaversineDistanceKm([selLon, selLat], [d.longitude, d.latitude]);
      return dist <= 35; // 35 km proximity for overlapping / clustered events
    });
  }, [selectedDisaster, disasters]);

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

  // 7. Click, hover, heatmap, and outside-click interactions
  React.useEffect(() => {
    if (!map || !isLoaded) return;

    const interactiveLayers = [circleLayerId, pulseLayerId, officialRingLayerId];

    // Helper to find candidate hazards within screen pixel radius around a point
    const findHazardsNearScreenPoint = (point: { x: number; y: number }, hitRadiusPx = 36) => {
      const candidates: Array<{ disaster: UnifiedDisasterEvent; distancePx: number }> = [];
      for (const d of disastersRef.current) {
        if (
          !d.isMappable ||
          typeof d.longitude !== "number" ||
          typeof d.latitude !== "number"
        ) {
          continue;
        }
        const screenPt = map.project([d.longitude, d.latitude]);
        const dist = Math.hypot(screenPt.x - point.x, screenPt.y - point.y);
        if (dist <= hitRadiusPx) {
          candidates.push({ disaster: d, distancePx: dist });
        }
      }

      candidates.sort((a, b) => {
        const sevA = SEVERITY_WEIGHT[a.disaster.severity] || 0;
        const sevB = SEVERITY_WEIGHT[b.disaster.severity] || 0;
        if (sevB !== sevA) {
          return sevB - sevA; // highest severity first
        }
        return a.distancePx - b.distancePx; // then nearest distance
      });

      return candidates;
    };

    // Direct click on marker layer
    const handleMarkerClick = (e: maplibregl.MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      if (!e.features || e.features.length === 0) return;
      (e.originalEvent as unknown as { _resqearthMarkerHandled?: boolean })._resqearthMarkerHandled = true;

      const feat = e.features[0];
      const clickedId = feat.properties?.id;
      const match = disastersRef.current.find((d) => d.id === clickedId);
      if (match) {
        onSelectDisasterRef.current?.(match);
      }
    };

    // General map click (handles Heatmap clicks, cluster disambiguation, and outside clicks)
    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if ((e.originalEvent as unknown as { _resqearthMarkerHandled?: boolean })._resqearthMarkerHandled) {
        return;
      }

      // 1. Check if a marker layer was under the click point
      const existingLayers = interactiveLayers.filter((id) => map.getLayer(id));
      if (existingLayers.length > 0) {
        const rendered = map.queryRenderedFeatures(e.point, { layers: existingLayers });
        if (rendered.length > 0) {
          const featId = rendered[0].properties?.id;
          const match = disastersRef.current.find((d) => d.id === featId);
          if (match) {
            onSelectDisasterRef.current?.(match);
            return;
          }
        }
      }

      // 2. Query nearby underlying hazard features (for heatmap clicks and clusters)
      const nearby = findHazardsNearScreenPoint(e.point, 36);
      if (nearby.length > 0) {
        onSelectDisasterRef.current?.(nearby[0].disaster);
        return;
      }

      // 3. Outside click on empty map area: deselect and close card
      if (selectedDisasterRef.current) {
        onSelectDisasterRef.current?.(null);
      }
    };

    // Mousemove handler for hover pointer in heatmap mode
    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const circleLayer = map.getLayer(circleLayerId);
      const markersVisible = circleLayer && map.getLayoutProperty(circleLayerId, "visibility") !== "none";
      if (!markersVisible) {
        const nearby = findHazardsNearScreenPoint(e.point, 36);
        map.getCanvas().style.cursor = nearby.length > 0 ? "pointer" : "";
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    for (const layerId of interactiveLayers) {
      map.on("click", layerId, handleMarkerClick);
      map.on("mouseenter", layerId, handleMouseEnter);
      map.on("mouseleave", layerId, handleMouseLeave);
    }

    map.on("click", handleMapClick);
    map.on("mousemove", handleMouseMove);

    return () => {
      if (map) {
        for (const layerId of interactiveLayers) {
          map.off("click", layerId, handleMarkerClick);
          map.off("mouseenter", layerId, handleMouseEnter);
          map.off("mouseleave", layerId, handleMouseLeave);
        }
        map.off("click", handleMapClick);
        map.off("mousemove", handleMouseMove);
      }
    };
  }, [map, isLoaded, circleLayerId, pulseLayerId, officialRingLayerId]);

  return (
    <>
      {selectedDisaster && (
        <MapHazardDetailCard
          disaster={selectedDisaster}
          overlappingHazards={overlappingHazards}
          onSelectHazard={(hazard) => onSelectDisaster(hazard)}
          onClose={() => onSelectDisaster(null)}
        />
      )}
    </>
  );
}
