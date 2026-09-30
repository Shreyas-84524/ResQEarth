"use client";

import * as React from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type {
  LngLat,
  BoundingBox,
  MapViewport,
  MapPopupData,
  MapContextValue,
} from "../types/map";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "../constants/map-config";
import { setLayerVisibility } from "../services/layer-registry";

export interface InternalMapContextValue extends MapContextValue {
  _setMap: (map: MapLibreMap | null) => void;
  _setIsLoaded: (loaded: boolean) => void;
  _setHasWebGLError: (hasError: boolean) => void;
  _setViewport: (viewport: MapViewport) => void;
}

export const MapContext = React.createContext<InternalMapContextValue | null>(null);

export interface MapProviderProps {
  children: React.ReactNode;
  initialCenter?: LngLat;
  initialZoom?: number;
}

export function MapProvider({
  children,
  initialCenter = DEFAULT_MAP_CENTER,
  initialZoom = DEFAULT_MAP_ZOOM,
}: MapProviderProps) {
  const [map, setMap] = React.useState<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasWebGLError, setHasWebGLError] = React.useState(false);

  const [viewport, setViewport] = React.useState<MapViewport>({
    center: initialCenter,
    zoom: initialZoom,
  });

  const [activeLayers, setActiveLayers] = React.useState<Record<string, boolean>>({
    "layer-earthquakes": true,
    "layer-floods": true,
    "layer-cyclones": true,
    "layer-wildfires": true,
    "layer-clusters": true,
    "layer-heatmap": false,
  });

  const [selectedFeature, setSelectedFeature] =
    React.useState<MapPopupData | null>(null);

  // Smoothly pan/zoom map to target coordinates
  const flyTo = React.useCallback(
    (
      center: LngLat,
      zoom: number = DEFAULT_MAP_ZOOM,
      options: { pitch?: number; bearing?: number; duration?: number } = {}
    ) => {
      if (!map) return;
      map.flyTo({
        center,
        zoom,
        pitch: options.pitch ?? 0,
        bearing: options.bearing ?? 0,
        duration: options.duration ?? 1200,
        essential: true,
      });
    },
    [map]
  );

  // Fit view inside given bounding box
  const fitBounds = React.useCallback(
    (bounds: BoundingBox, padding: number = 40) => {
      if (!map) return;
      const [minLng, minLat, maxLng, maxLat] = bounds;
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding, maxZoom: 15, duration: 1200, essential: true }
      );
    },
    [map]
  );

  // Toggle layer visibility
  const toggleLayer = React.useCallback(
    (layerId: string, visible?: boolean) => {
      setActiveLayers((prev) => {
        const nextState = visible !== undefined ? visible : !prev[layerId];
        if (map && map.isStyleLoaded()) {
          setLayerVisibility(map, layerId, nextState);
        }
        return {
          ...prev,
          [layerId]: nextState,
        };
      });
    },
    [map]
  );

  // Reset to default Mumbai viewport
  const resetView = React.useCallback(() => {
    flyTo(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
  }, [flyTo]);

  const value = React.useMemo<InternalMapContextValue>(
    () => ({
      map,
      isLoaded,
      hasWebGLError,
      viewport,
      activeLayers,
      selectedFeature,
      flyTo,
      fitBounds,
      toggleLayer,
      setSelectedFeature,
      resetView,
      _setMap: setMap,
      _setIsLoaded: setIsLoaded,
      _setHasWebGLError: setHasWebGLError,
      _setViewport: setViewport,
    }),
    [
      map,
      isLoaded,
      hasWebGLError,
      viewport,
      activeLayers,
      selectedFeature,
      flyTo,
      fitBounds,
      toggleLayer,
      setSelectedFeature,
      resetView,
      setMap,
      setIsLoaded,
      setHasWebGLError,
      setViewport,
    ]
  );

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}
