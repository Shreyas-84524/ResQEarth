"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Map as MapLibreMap } from "maplibre-gl";
import { cn } from "@/lib/utils";
import type { LngLat, RegionPreset } from "../types/map";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../constants/map-config";
import { MapProvider, MapContext } from "../context/map-context";
import { MapLoadingSkeleton } from "./map-loading-skeleton";
import { MapRegionPresetPicker } from "./map-region-preset-picker";
import {
  MapFilterChips,
  MapLegend,
  type FilterChipOption,
} from "@/components/common/map-overlay";
import { Waves, Wind, Activity, Flame } from "lucide-react";

// Dynamic SSR-safe loading of MapContainer
const DynamicMapContainer = dynamic(
  () =>
    import("./map-container").then((mod) => ({
      default: mod.MapContainer,
    })),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

export interface MapViewProps {
  initialCenter?: LngLat;
  initialZoom?: number;
  initialRegionId?: string;
  className?: string;
  showFilterChips?: boolean;
  showRegionPicker?: boolean;
  showLegend?: boolean;
  showNavigationControls?: boolean;
  showFullscreenControl?: boolean;
  showScaleControl?: boolean;
  showGeolocateControl?: boolean;
  interactive?: boolean;
  children?: React.ReactNode;
  onMapReady?: (map: MapLibreMap) => void;
}

const DEFAULT_MAP_FILTER_OPTIONS: FilterChipOption[] = [
  { id: "all", label: "All Hazards" },
  { id: "flood", label: "Floods", icon: Waves },
  { id: "cyclone", label: "Cyclones", icon: Wind },
  { id: "earthquake", label: "Earthquakes", icon: Activity },
  { id: "wildfire", label: "Wildfires", icon: Flame },
];

function MapViewInternal({
  initialCenter,
  initialZoom,
  className,
  showFilterChips = true,
  showRegionPicker = false,
  showLegend = true,
  showNavigationControls = true,
  showFullscreenControl = true,
  showScaleControl = true,
  showGeolocateControl = true,
  interactive = true,
  children,
  onMapReady,
}: MapViewProps) {
  const mapContext = React.useContext(MapContext);
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    if (mapContext) {
      if (filterId === "all") {
        mapContext.toggleLayer("layer-earthquakes", true);
        mapContext.toggleLayer("layer-floods", true);
        mapContext.toggleLayer("layer-cyclones", true);
        mapContext.toggleLayer("layer-wildfires", true);
      } else {
        mapContext.toggleLayer("layer-earthquakes", filterId === "earthquake");
        mapContext.toggleLayer("layer-floods", filterId === "flood");
        mapContext.toggleLayer("layer-cyclones", filterId === "cyclone");
        mapContext.toggleLayer("layer-wildfires", filterId === "wildfire");
      }
    }
  };

  const handleRegionSelect = (preset: RegionPreset) => {
    if (mapContext) {
      mapContext.setRegion(preset);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <DynamicMapContainer
        initialCenter={initialCenter}
        initialZoom={initialZoom}
        showNavigationControls={showNavigationControls}
        showFullscreenControl={showFullscreenControl}
        showScaleControl={showScaleControl}
        showGeolocateControl={showGeolocateControl}
        interactive={interactive}
        onMapReady={onMapReady}
      >
        {/* Top-Left: Category Filter Chips Overlay */}
        {showFilterChips && (
          <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-80px)]">
            <MapFilterChips
              options={DEFAULT_MAP_FILTER_OPTIONS}
              selectedId={selectedFilter}
              onSelect={handleFilterSelect}
            />
          </div>
        )}

        {/* Top-Center/Right: Region Preset Picker if enabled */}
        {showRegionPicker && (
          <div className="absolute top-14 left-3 z-10 max-w-[calc(100%-80px)]">
            <MapRegionPresetPicker
              activeRegionId={mapContext?.activeRegion?.id}
              onSelectRegion={handleRegionSelect}
            />
          </div>
        )}

        {/* Bottom-Left: Map Legend Overlay */}
        {showLegend && <MapLegend />}

        {/* Custom Nested Children */}
        {children}
      </DynamicMapContainer>
    </div>
  );
}

export function MapView(props: MapViewProps) {
  return (
    <MapProvider
      initialCenter={props.initialCenter || DEFAULT_MAP_CENTER}
      initialZoom={props.initialZoom || DEFAULT_MAP_ZOOM}
      initialRegionId={props.initialRegionId || "mumbai"}
    >
      <MapViewInternal {...props} />
    </MapProvider>
  );
}
