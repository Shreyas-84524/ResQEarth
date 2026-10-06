"use client";

import * as React from "react";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap } from "../hooks/use-map";
import { useGeolocation } from "../hooks/use-geolocation";
import { MAP_SOURCES, MAP_LAYERS } from "../constants/map-layers";
import { createAccuracyCircleGeoJson } from "../services/accuracy-circle";

export function MapUserLocationMarker() {
  const { map, isLoaded } = useMap();
  const { location } = useGeolocation();

  // Synchronize user location marker with MapLibre layers
  React.useEffect(() => {
    if (!map || !isLoaded || !map.isStyleLoaded()) return;

    // Only render the GPS location marker when the user has actually granted GPS
    // and an on-demand GPS position has been resolved.
    if (location.source !== "gps") {
      if (map.getLayer(MAP_LAYERS.USER_LOCATION_DOT)) {
        map.setLayoutProperty(MAP_LAYERS.USER_LOCATION_DOT, "visibility", "none");
      }
      if (map.getLayer(`${MAP_LAYERS.USER_LOCATION_DOT}-halo`)) {
        map.setLayoutProperty(`${MAP_LAYERS.USER_LOCATION_DOT}-halo`, "visibility", "none");
      }
      if (map.getLayer(MAP_LAYERS.USER_LOCATION_ACCURACY)) {
        map.setLayoutProperty(MAP_LAYERS.USER_LOCATION_ACCURACY, "visibility", "none");
      }
      return;
    }

    const userLngLat: [number, number] = [location.longitude, location.latitude];
    const accuracyMeters = location.accuracyMeters || 150;

    const pointGeoJson = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          id: "user-current-location-point",
          geometry: {
            type: "Point" as const,
            coordinates: userLngLat,
          },
          properties: {
            title: location.locality,
            accuracy: accuracyMeters,
            source: location.source,
          },
        },
      ],
    };

    const circleGeoJson = {
      type: "FeatureCollection" as const,
      features: [createAccuracyCircleGeoJson(userLngLat, accuracyMeters)],
    };

    // 1. Accuracy Circle Source & Layer
    const accuracySourceId = `${MAP_SOURCES.USER_LOCATION}-accuracy`;
    const existingAccuracySource = map.getSource(accuracySourceId) as GeoJSONSource | undefined;

    if (existingAccuracySource) {
      existingAccuracySource.setData(circleGeoJson as unknown as GeoJSON.GeoJSON);
      if (map.getLayer(MAP_LAYERS.USER_LOCATION_ACCURACY)) {
        map.setLayoutProperty(MAP_LAYERS.USER_LOCATION_ACCURACY, "visibility", "visible");
      }
    } else {
      map.addSource(accuracySourceId, {
        type: "geojson",
        data: circleGeoJson as unknown as GeoJSON.GeoJSON,
      });

      if (!map.getLayer(MAP_LAYERS.USER_LOCATION_ACCURACY)) {
        map.addLayer(
          {
            id: MAP_LAYERS.USER_LOCATION_ACCURACY,
            type: "fill",
            source: accuracySourceId,
            paint: {
              "fill-color": "#3b82f6",
              "fill-opacity": 0.15,
            },
          },
          // Below point marker
          map.getLayer(MAP_LAYERS.HAZARD_CIRCLES) ? MAP_LAYERS.HAZARD_CIRCLES : undefined
        );
      }
    }

    // 2. Center Dot Point Source & Layer
    const pointSourceId = `${MAP_SOURCES.USER_LOCATION}-point`;
    const existingPointSource = map.getSource(pointSourceId) as GeoJSONSource | undefined;

    if (existingPointSource) {
      existingPointSource.setData(pointGeoJson as unknown as GeoJSON.GeoJSON);
      if (map.getLayer(MAP_LAYERS.USER_LOCATION_DOT)) {
        map.setLayoutProperty(MAP_LAYERS.USER_LOCATION_DOT, "visibility", "visible");
      }
      if (map.getLayer(`${MAP_LAYERS.USER_LOCATION_DOT}-halo`)) {
        map.setLayoutProperty(`${MAP_LAYERS.USER_LOCATION_DOT}-halo`, "visibility", "visible");
      }
    } else {
      map.addSource(pointSourceId, {
        type: "geojson",
        data: pointGeoJson as unknown as GeoJSON.GeoJSON,
      });

      // Outer pulse ring
      if (!map.getLayer(`${MAP_LAYERS.USER_LOCATION_DOT}-halo`)) {
        map.addLayer({
          id: `${MAP_LAYERS.USER_LOCATION_DOT}-halo`,
          type: "circle",
          source: pointSourceId,
          paint: {
            "circle-radius": 14,
            "circle-color": "#3b82f6",
            "circle-opacity": 0.3,
            "circle-blur": 0.5,
          },
        });
      }

      // Inner solid blue dot
      if (!map.getLayer(MAP_LAYERS.USER_LOCATION_DOT)) {
        map.addLayer({
          id: MAP_LAYERS.USER_LOCATION_DOT,
          type: "circle",
          source: pointSourceId,
          paint: {
            "circle-radius": 7,
            "circle-color": "#2563eb",
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
          },
        });
      }
    }
  }, [map, isLoaded, location]);

  return null;
}
