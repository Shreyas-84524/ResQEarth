"use client";

import { useMap } from "./use-map";
import type { MapViewport, LngLat } from "../types/map";

export interface UseMapViewportResult {
  viewport: MapViewport;
  center: LngLat;
  zoom: number;
  flyTo: (center: LngLat, zoom?: number) => void;
  resetView: () => void;
}

/**
 * Convenience hook for tracking and updating map viewport
 */
export function useMapViewport(): UseMapViewportResult {
  const { viewport, flyTo, resetView } = useMap();

  return {
    viewport,
    center: viewport.center,
    zoom: viewport.zoom,
    flyTo,
    resetView,
  };
}
