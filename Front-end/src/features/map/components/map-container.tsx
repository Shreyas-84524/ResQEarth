"use client";

import * as React from "react";
import maplibregl, {
  type Map as MapLibreMap,
  type StyleSpecification,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import type { LngLat, MapViewport, BoundingBox } from "../types/map";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_MIN_ZOOM,
  DEFAULT_MAP_MAX_ZOOM,
  DEFAULT_MAP_STYLE,
} from "../constants/map-config";
import { MapContext } from "../context/map-context";
import { MapLoadingSkeleton } from "./map-loading-skeleton";
import { MapErrorFallback } from "./map-error-fallback";
import { MapAttribution } from "@/components/common/map-overlay";

export interface MapContainerProps {
  initialCenter?: LngLat;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  styleSpecification?: StyleSpecification | string;
  showNavigationControls?: boolean;
  showFullscreenControl?: boolean;
  showScaleControl?: boolean;
  showGeolocateControl?: boolean;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
  onMapReady?: (map: MapLibreMap) => void;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function MapContainer({
  initialCenter = DEFAULT_MAP_CENTER,
  initialZoom = DEFAULT_MAP_ZOOM,
  minZoom = DEFAULT_MAP_MIN_ZOOM,
  maxZoom = DEFAULT_MAP_MAX_ZOOM,
  styleSpecification = DEFAULT_MAP_STYLE as unknown as StyleSpecification,
  showNavigationControls = true,
  showFullscreenControl = true,
  showScaleControl = true,
  showGeolocateControl = true,
  interactive = true,
  className,
  children,
  onMapReady,
}: MapContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);

  const initialCenterRef = React.useRef(initialCenter);
  const initialZoomRef = React.useRef(initialZoom);
  const onMapReadyRef = React.useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  const [isLoading, setIsLoading] = React.useState(true);
  const [webglError, setWebglError] = React.useState<string | null>(null);

  const mapContext = React.useContext(MapContext);

  // Initialize MapLibre GL instance
  const initMap = React.useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    // Check WebGL availability
    if (!checkWebGLSupport()) {
      setWebglError(
        "WebGL is not supported or disabled in this browser/device. Please enable hardware acceleration."
      );
      setIsLoading(false);
      if (mapContext?._setHasWebGLError) {
        mapContext._setHasWebGLError(true);
      }
      return;
    }

    setWebglError(null);
    setIsLoading(true);

    try {
      // Create map instance
      const mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: styleSpecification,
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        minZoom,
        maxZoom,
        interactive,
        attributionControl: false, // We use custom MapAttribution
      });

      // Safety timer: ensure loading skeleton never blocks children permanently
      const safetyTimer = setTimeout(() => {
        setIsLoading(false);
        if (mapContext?._setIsLoaded) {
          mapContext._setIsLoaded(true);
        }
      }, 3500);

      // Add standard controls if enabled
      if (showNavigationControls) {
        const navControl = new NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        });
        mapInstance.addControl(navControl, "top-right");
      }

      if (showFullscreenControl) {
        const fullControl = new FullscreenControl();
        mapInstance.addControl(fullControl, "top-right");
      }

      if (showScaleControl) {
        const scale = new ScaleControl({
          maxWidth: 120,
          unit: "metric",
        });
        mapInstance.addControl(scale, "bottom-left");
      }

      if (showGeolocateControl) {
        const geolocate = new GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserLocation: true,
        });
        mapInstance.addControl(geolocate, "top-right");
      }

      // Map loaded event
      mapInstance.on("load", () => {
        clearTimeout(safetyTimer);
        setIsLoading(false);
        mapRef.current = mapInstance;

        if (mapContext?._setMap) {
          mapContext._setMap(mapInstance);
          mapContext._setIsLoaded(true);
        }

        if (onMapReadyRef.current) {
          onMapReadyRef.current(mapInstance);
        }

        // Trigger safe initial resize
        mapInstance.resize();
      });

      // Viewport tracking
      mapInstance.on("moveend", () => {
        if (!mapInstance) return;
        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        const bounds = mapInstance.getBounds();

        const viewportData: MapViewport = {
          center: [center.lng, center.lat],
          zoom,
          pitch: mapInstance.getPitch(),
          bearing: mapInstance.getBearing(),
          bounds: [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth(),
          ] as BoundingBox,
        };

        if (mapContext?._setViewport) {
          mapContext._setViewport(viewportData);
        }
      });

      mapInstance.on("error", (e) => {
        clearTimeout(safetyTimer);
        // Suppress non-fatal tile errors (e.g. rapid zoom before tile loads)
        if (e && e.error && typeof e.error.message === "string") {
          if (!e.error.message.includes("404")) {
            console.warn("MapLibre event:", e.error.message);
          }
        }
        setIsLoading(false);
        if (mapContext?._setIsLoaded) {
          mapContext._setIsLoaded(true);
        }
      });

      mapRef.current = mapInstance;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize MapLibre engine.";
      console.error("Failed to initialize MapLibre GL map:", err);
      setWebglError(errorMessage);
      setIsLoading(false);
      if (mapContext?._setHasWebGLError) {
        mapContext._setHasWebGLError(true);
      }
    }
  }, [
    minZoom,
    maxZoom,
    styleSpecification,
    showNavigationControls,
    showFullscreenControl,
    showScaleControl,
    showGeolocateControl,
    interactive,
    mapContext,
  ]);

  // Handle mounting and unmounting
  React.useEffect(() => {
    initMap();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
      if (mapContext?._setMap) {
        mapContext._setMap(null);
        mapContext._setIsLoaded(false);
      }
    };
  }, [initMap, mapContext]);

  // Handle container resize dynamically via ResizeObserver
  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (webglError) {
    return <MapErrorFallback error={webglError} onRetry={initMap} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative h-[380px] sm:h-[480px] w-full overflow-hidden rounded-xl border border-border/80 bg-slate-950 text-slate-100 shadow-md",
        className
      )}
    >
      {/* Map Canvas Container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-20">
          <MapLoadingSkeleton />
        </div>
      )}

      {/* Custom Overlays and Children */}
      {!isLoading && children}

      {/* Baseline OpenStreetMap Attribution */}
      <MapAttribution />
    </div>
  );
}
