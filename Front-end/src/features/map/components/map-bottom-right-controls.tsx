"use client";

import * as React from "react";
import { Navigation, Plus, Minus, Loader2, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMap } from "../hooks/use-map";
import { useGeolocation } from "../hooks/use-geolocation";

export interface MapBottomRightControlsProps {
  onLocationDenied?: () => void;
  showZoomControls?: boolean;
  showFullscreenControl?: boolean;
  className?: string;
}

export function MapBottomRightControls({
  onLocationDenied,
  showZoomControls = true,
  showFullscreenControl = false,
  className,
}: MapBottomRightControlsProps) {
  const { map, flyTo } = useMap();
  const { location, permission, isLocating, requestGpsLocation } = useGeolocation();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Synchronize fullscreen state
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!map) return;
    const container = map.getContainer();
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut({ duration: 300 });
    }
  };

  const [hasDeniedLocally, setHasDeniedLocally] = React.useState(false);

  /**
   * On-demand Geolocation Trigger:
   * 1. If permission was already denied in this browser session:
   *    Do not repeatedly prompt the browser; immediately show the non-blocking
   *    guidance message offering manual selection.
   * 2. If not denied: request browser GPS permission on-demand.
   *    - If granted: fly to coordinates, location marker & weather update reactively.
   *    - If denied: keep map usable, trigger non-blocking message.
   */
  const handleLocateClick = async () => {
    if (permission === "denied" || hasDeniedLocally) {
      onLocationDenied?.();
      return;
    }

    try {
      const resolved = await requestGpsLocation();
      if (resolved && map) {
        setHasDeniedLocally(false);
        flyTo([resolved.longitude, resolved.latitude], 12);
      } else {
        setHasDeniedLocally(true);
        onLocationDenied?.();
      }
    } catch {
      setHasDeniedLocally(true);
      onLocationDenied?.();
    }
  };

  const isGpsActive = location.source === "gps";

  return (
    <div
      className={cn(
        "absolute bottom-7 right-3 z-20 flex flex-col gap-1.5 items-end",
        className
      )}
      role="group"
      aria-label="Map Navigation & Geolocation Controls"
    >
      {/* Zoom Controls */}
      {showZoomControls && (
        <div
          className="flex flex-col rounded-lg border border-border/80 bg-background/90 p-0.5 backdrop-blur shadow-md"
          role="group"
          aria-label="Zoom controls"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded text-foreground hover:bg-muted"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <div className="h-[1px] w-full bg-border/60" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded text-foreground hover:bg-muted"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Fullscreen Toggle (if enabled) */}
      {showFullscreenControl && (
        <div className="rounded-lg border border-border/80 bg-background/90 p-0.5 backdrop-blur shadow-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded text-foreground hover:bg-muted"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* On-Demand Geolocation Button */}
      <div className="rounded-lg border border-border/80 bg-background/90 p-0.5 backdrop-blur shadow-md">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleLocateClick}
          disabled={isLocating}
          className={cn(
            "h-8 w-8 rounded transition-all",
            isGpsActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
              : "text-foreground hover:bg-muted hover:text-primary"
          )}
          title={
            isLocating
              ? "Acquiring GPS coordinates..."
              : isGpsActive
              ? "GPS Active: Click to re-center on your location"
              : "Locate Me (Request GPS Location)"
          }
          aria-label="Locate / Geolocation"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Navigation
              className={cn(
                "h-4 w-4 transition-transform",
                isGpsActive && "fill-current"
              )}
            />
          )}
        </Button>
      </div>
    </div>
  );
}
