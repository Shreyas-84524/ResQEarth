"use client";

import * as React from "react";
import {
  Layers,
  MapPin,
  Flame,
  Maximize2,
  Navigation,
  RotateCcw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMap } from "@/features/map/hooks/use-map";
import { useGeolocation } from "@/features/map/hooks/use-geolocation";
import { computeBoundingBox } from "@/features/map/services/geojson-helper";
import type { MapGisDisplayMode } from "./map-unified-disaster-layer";
import type { UnifiedDisasterEvent } from "../types/disaster-event";

export interface MapGisToolbarProps {
  displayMode: MapGisDisplayMode;
  onDisplayModeChange: (mode: MapGisDisplayMode) => void;
  disasters: UnifiedDisasterEvent[];
  isLegendOpen: boolean;
  onToggleLegend: () => void;
  className?: string;
}

export function MapGisToolbar({
  displayMode,
  onDisplayModeChange,
  disasters,
  isLegendOpen,
  onToggleLegend,
  className,
}: MapGisToolbarProps) {
  const { flyTo, fitBounds, resetView } = useMap();
  const { location } = useGeolocation();

  // 1. Fit Map view to current filtered disaster events
  const handleFitToEvents = React.useCallback(() => {
    if (!disasters || disasters.length === 0) {
      resetView();
      return;
    }

    const coords = disasters.map((d) => [d.longitude, d.latitude] as [number, number]);
    const bbox = computeBoundingBox(coords);
    if (bbox) {
      fitBounds(bbox, 45);
    } else {
      resetView();
    }
  }, [disasters, fitBounds, resetView]);

  // 2. Recenter to user's GPS / Selected Region
  const handleRecenterToLocation = React.useCallback(() => {
    if (location && typeof location.longitude === "number" && typeof location.latitude === "number") {
      flyTo([location.longitude, location.latitude], 11);
    } else {
      resetView();
    }
  }, [location, flyTo, resetView]);

  return (
    <div
      className={cn(
        "absolute top-3 right-3 z-20 flex flex-col gap-2 items-end",
        className
      )}
    >
      {/* 1. Display Mode Segmented Switcher */}
      <div
        className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-background/90 p-1 backdrop-blur shadow-md text-xs font-semibold"
        role="group"
        aria-label="GIS Map Display Mode"
      >
        <button
          type="button"
          onClick={() => onDisplayModeChange("all")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs",
            displayMode === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
          title="Hybrid: Dynamic zoom heatmap + vector markers"
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Hybrid</span>
        </button>

        <button
          type="button"
          onClick={() => onDisplayModeChange("markers")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs",
            displayMode === "markers"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
          title="Markers Only: Precision hazard points"
        >
          <MapPin className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Markers</span>
        </button>

        <button
          type="button"
          onClick={() => onDisplayModeChange("heatmap")}
          className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs",
            displayMode === "heatmap"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
          title="Heatmap Only: Continuous severity thermal density"
        >
          <Flame className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Heatmap</span>
        </button>
      </div>

      {/* 2. Quick Action Buttons Floating Panel */}
      <div
        className="flex flex-col gap-1 rounded-lg border border-border/80 bg-background/90 p-1 backdrop-blur shadow-md"
        role="group"
        aria-label="GIS Map Actions"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded hover:bg-muted text-foreground"
          onClick={handleFitToEvents}
          title="Fit View to Filtered Disasters"
          aria-label="Fit View to Filtered Disasters"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded hover:bg-muted text-foreground"
          onClick={handleRecenterToLocation}
          title="Recenter to My Location"
          aria-label="Recenter to My Location"
        >
          <Navigation className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded hover:bg-muted text-foreground"
          onClick={resetView}
          title="Reset to Mumbai Anchor View"
          aria-label="Reset to Mumbai Anchor View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded hover:bg-muted text-foreground",
            isLegendOpen && "bg-primary/10 text-primary"
          )}
          onClick={onToggleLegend}
          title="Toggle GIS Map Legend"
          aria-label="Toggle GIS Map Legend"
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
