"use client";

import * as React from "react";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useMap } from "@/features/map/hooks/use-map";
import { getSeverityColorExpression } from "@/features/map/services/style-expressions";
import type { NormalizedGlobalDisaster } from "../types/global-disaster";
import { GlobalDisasterPopup } from "./global-disaster-popup";

export interface MapGlobalDisasterLayerProps {
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Point>;
  disasters: NormalizedGlobalDisaster[];
  selectedDisaster: NormalizedGlobalDisaster | null;
  onSelectDisaster: (disaster: NormalizedGlobalDisaster | null) => void;
  visible?: boolean;
}

export function MapGlobalDisasterLayer({
  geoJson,
  disasters,
  selectedDisaster,
  onSelectDisaster,
  visible = true,
}: MapGlobalDisasterLayerProps) {
  const { map, isLoaded } = useMap();

  const sourceId = "resqearth-source-global-disasters";
  const circleLayerId = "resqearth-global-disaster-circles";
  const pulseLayerId = "resqearth-global-disaster-pulse";
  const labelLayerId = "resqearth-global-disaster-labels";

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

    // Add High-Severity Pulse Ring Layer (for CRITICAL or HIGH events like major cyclones or complex fires)
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
          "circle-color": "rgba(234, 88, 12, 0.2)",
          "circle-radius": ["*", ["get", "markerRadius"], 1.6],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ea580c",
          "circle-stroke-opacity": 0.8,
        },
      });
    }

    // Add Primary Global Disaster Point Circle Layer
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
          "circle-opacity": 0.85,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // Add Category Text Labels at closer zoom levels
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
  }, [map, isLoaded, disasters, onSelectDisaster, sourceId, circleLayerId, pulseLayerId, labelLayerId]);

  // Update GeoJSON source whenever data updates
  React.useEffect(() => {
    if (!map || !isLoaded) return;
    const src = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(geoJson);
    }
  }, [map, isLoaded, geoJson, sourceId]);

  // Update visibility when toggled
  React.useEffect(() => {
    if (!map || !isLoaded) return;
    const vis = visible ? "visible" : "none";
    if (map.getLayer(circleLayerId)) map.setLayoutProperty(circleLayerId, "visibility", vis);
    if (map.getLayer(pulseLayerId)) map.setLayoutProperty(pulseLayerId, "visibility", vis);
    if (map.getLayer(labelLayerId)) map.setLayoutProperty(labelLayerId, "visibility", vis);
  }, [map, isLoaded, visible, circleLayerId, pulseLayerId, labelLayerId]);

  return (
    <>
      {selectedDisaster && (
        <GlobalDisasterPopup
          disaster={selectedDisaster}
          onClose={() => onSelectDisaster(null)}
        />
      )}
    </>
  );
}
