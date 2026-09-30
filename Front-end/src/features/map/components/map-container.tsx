"use client";

import * as React from "react";
import maplibregl, {
  type Map as MapLibreMap,
  type StyleSpecification,
  ScaleControl,
  NavigationControl,
  FullscreenControl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import type { LngLat, MapViewport, BoundingBox } from "../types/map";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MAP_MIN_ZOOM,
  DEFAULT_MAP_MAX_ZOOM,
  DEFAULT_MAPTILER_STYLE,
  getMapTilerStyleUrl,
  isMapTilerKeyConfigured,
  MAPTILER_CONFIG_ERROR_MESSAGE,
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
  styleSpecification,
  showNavigationControls = false,
  showFullscreenControl = false,
  showScaleControl = true,
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
  const [configError, setConfigError] = React.useState<string | null>(null);

  const mapContext = React.useContext(MapContext);
  const mapContextRef = React.useRef(mapContext);
  mapContextRef.current = mapContext;

  // Initialize MapLibre GL instance with MapTiler vector basemap
  const initMap = React.useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    // 1. Check WebGL availability
    if (!checkWebGLSupport()) {
      setWebglError(
        "WebGL is not supported or disabled in this browser/device. Please enable hardware acceleration."
      );
      setIsLoading(false);
      if (mapContextRef.current?._setHasWebGLError) {
        mapContextRef.current._setHasWebGLError(true);
      }
      return;
    }

    // 2. Resolve MapTiler vector style
    let resolvedStyle = styleSpecification;
    if (!resolvedStyle) {
      if (!isMapTilerKeyConfigured()) {
        setConfigError(MAPTILER_CONFIG_ERROR_MESSAGE);
        setIsLoading(false);
        return;
      }
      const maptilerUrl = getMapTilerStyleUrl(DEFAULT_MAPTILER_STYLE);
      if (!maptilerUrl) {
        setConfigError(MAPTILER_CONFIG_ERROR_MESSAGE);
        setIsLoading(false);
        return;
      }
      resolvedStyle = maptilerUrl;
    }

    setWebglError(null);
    setConfigError(null);
    setIsLoading(true);

    try {
      // 3. Create MapLibre map instance
      const mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: resolvedStyle,
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        minZoom,
        maxZoom,
        interactive,
        attributionControl: false, // Custom MapAttribution handles MapTiler & OSM
      });

      // Standard scale bar (bottom-left)
      if (showScaleControl) {
        const scale = new ScaleControl({
          maxWidth: 120,
          unit: "metric",
        });
        mapInstance.addControl(scale, "bottom-left");
      }

      // Optional built-in navigation controls
      if (showNavigationControls) {
        const nav = new NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        });
        mapInstance.addControl(nav, "top-right");
      }

      // Optional built-in fullscreen control
      if (showFullscreenControl) {
        const full = new FullscreenControl();
        mapInstance.addControl(full, "top-right");
      }

      // Map loaded event
      mapInstance.on("load", () => {
        setIsLoading(false);
        mapRef.current = mapInstance;

        if (mapContextRef.current?._setMap) {
          mapContextRef.current._setMap(mapInstance);
          mapContextRef.current._setIsLoaded(true);
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

        if (mapContextRef.current?._setViewport) {
          mapContextRef.current._setViewport(viewportData);
        }
      });

      mapInstance.on("error", (e) => {
        // Suppress non-fatal tile errors (e.g. transient 404s during rapid zoom)
        if (e && e.error && typeof e.error.message === "string") {
          if (!e.error.message.includes("404")) {
            console.warn("MapLibre event:", e.error.message);
          }
        }
      });

      mapRef.current = mapInstance;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize MapLibre engine.";
      console.error("Failed to initialize MapLibre GL map:", err);
      setWebglError(errorMessage);
      setIsLoading(false);
      if (mapContextRef.current?._setHasWebGLError) {
        mapContextRef.current._setHasWebGLError(true);
      }
    }
  }, [
    minZoom,
    maxZoom,
    styleSpecification,
    showNavigationControls,
    showFullscreenControl,
    showScaleControl,
    interactive,
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
      if (mapContextRef.current?._setMap) {
        mapContextRef.current._setMap(null);
        mapContextRef.current._setIsLoaded(false);
      }
    };
  }, [initMap]);

  // Container resize observer
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

  return (
    <div
      className={cn(
        "relative h-[380px] sm:h-[480px] w-full overflow-hidden rounded-xl border border-border/80 bg-slate-950 text-slate-100 shadow-md",
        className
      )}
    >
      {/* Map Canvas Container */}
      <div ref={containerRef} className="h-full w-full" />

      {/* 1. Missing MapTiler API Key Graceful Error Overlay */}
      {configError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-background/95 backdrop-blur-xs">
          <MapErrorFallback
            title="MapTiler API Key Required"
            error={configError}
            isConfigError={true}
            onRetry={initMap}
          />
        </div>
      )}

      {/* 2. WebGL Hardware Error Overlay */}
      {webglError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-background/95">
          <MapErrorFallback error={webglError} onRetry={initMap} />
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !configError && !webglError && (
        <div className="absolute inset-0 z-20">
          <MapLoadingSkeleton />
        </div>
      )}

      {/* Custom Overlays and Children (Top controls, GIS Toolbar, Bottom-Right Locate button) */}
      {children}

      {/* MapTiler + OpenStreetMap Attribution */}
      <MapAttribution />
    </div>
  );
}
