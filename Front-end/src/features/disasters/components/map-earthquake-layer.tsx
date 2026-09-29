"use client";

import * as React from "react";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useMap } from "@/features/map/hooks/use-map";
import { MAP_SOURCES } from "@/features/map/constants/map-layers";
import { getSeverityColorExpression } from "@/features/map/services/style-expressions";
import type { NormalizedEarthquake } from "../types/earthquake";
import { EarthquakePopup } from "./earthquake-popup";

export interface MapEarthquakeLayerProps {
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Point>;
  earthquakes: NormalizedEarthquake[];
  selectedEarthquake: NormalizedEarthquake | null;
  onSelectEarthquake: (earthquake: NormalizedEarthquake | null) => void;
  visible?: boolean;
}

export function MapEarthquakeLayer({
  geoJson,
  earthquakes,
  selectedEarthquake,
  onSelectEarthquake,
  visible = true,
}: MapEarthquakeLayerProps) {
  const { map, isLoaded } = useMap();

  const sourceId = MAP_SOURCES.EARTHQUAKES;
  const circleLayerId = "resqearth-earthquake-circles";
  const pulseLayerId = "resqearth-earthquake-pulse";
  const labelLayerId = "resqearth-earthquake-labels";

  // 1. Initialize Source and Layers once Map is ready
  React.useEffect(() => {
    if (!map || !isLoaded) return;

    // Add GeoJSON source if missing
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    // Add High-Magnitude Pulse Ring Layer
    if (!map.getLayer(pulseLayerId)) {
      map.addLayer({
        id: pulseLayerId,
        type: "circle",
        source: sourceId,
        filter: [">=", ["get", "magnitude"], 5.5],
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": "rgba(220, 38, 38, 0.2)",
          "circle-radius": ["*", ["get", "markerRadius"], 1.7],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#dc2626",
          "circle-stroke-opacity": 0.8,
        },
      });
    }

    // Add Primary Earthquake Point Circle Layer
    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: "circle",
        source: sourceId,
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": getSeverityColorExpression("#f59e0b"),
          "circle-radius": ["get", "markerRadius"],
          "circle-opacity": 0.88,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    // Add Magnitude Text Labels at closer zoom levels
    if (!map.getLayer(labelLayerId)) {
      map.addLayer({
        id: labelLayerId,
        type: "symbol",
        source: sourceId,
        minzoom: 5,
        layout: {
          visibility: "visible",
          "text-field": ["to-string", ["get", "magnitude"]],
          "text-size": 10,
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
      const match = earthquakes.find((eq) => eq.id === clickedId);
      if (match) {
        onSelectEarthquake(match);
      }
    };

    // 3. Mouse Hover Cursor
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
  }, [map, isLoaded, earthquakes, onSelectEarthquake, sourceId, circleLayerId, pulseLayerId, labelLayerId]);

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
      {selectedEarthquake && (
        <EarthquakePopup
          earthquake={selectedEarthquake}
          onClose={() => onSelectEarthquake(null)}
        />
      )}
    </>
  );
}
