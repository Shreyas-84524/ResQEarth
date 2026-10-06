"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Map as MapLibreMap } from "maplibre-gl";
import { cn } from "@/lib/utils";
import type { LngLat } from "../types/map";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../constants/map-config";
import { MapProvider, MapContext } from "../context/map-context";
import { useGeolocation } from "../hooks/use-geolocation";
import { MapLoadingSkeleton } from "./map-loading-skeleton";
import { MapUserLocationMarker } from "./map-user-location-marker";
import { MapLocationStatusBadge } from "./map-location-status-badge";
import { MapBottomRightControls } from "./map-bottom-right-controls";
import { LocationSearchDialog } from "./location-search-dialog";
import { WeatherCompactBadge } from "@/features/weather/components/weather-compact-badge";
import { useWeather } from "@/features/weather/hooks/use-weather";
import {
  MapFilterChips,
  MapLegend,
  type FilterChipOption,
} from "@/components/common/map-overlay";
import { Waves, Wind, Activity, Flame, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  className?: string;
  showFilterChips?: boolean;
  showLocationBadge?: boolean;
  showWeatherBadge?: boolean;
  showLegend?: boolean;
  showScaleControl?: boolean;
  showZoomControls?: boolean;
  showFullscreenControl?: boolean;
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
  showLocationBadge = true,
  showWeatherBadge = true,
  showLegend = true,
  showScaleControl = true,
  showZoomControls = true,
  showFullscreenControl = true,
  interactive = true,
  children,
  onMapReady,
}: MapViewProps) {
  const mapContext = React.useContext(MapContext);
  const { location } = useGeolocation();
  const { weather, isLoading: isWeatherLoading } = useWeather();
  const [selectedFilter, setSelectedFilter] = React.useState("all");
  const [isLocationDialogOpen, setIsLocationDialogOpen] = React.useState(false);
  const [showDeniedNotice, setShowDeniedNotice] = React.useState(false);

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

  const mapCenter = React.useMemo<LngLat>(() => {
    if (initialCenter) return initialCenter;
    return [location.longitude, location.latitude];
  }, [initialCenter, location.longitude, location.latitude]);

  return (
    <div className={cn("relative w-full", className)}>
      <DynamicMapContainer
        initialCenter={mapCenter}
        initialZoom={initialZoom}
        showScaleControl={showScaleControl}
        showNavigationControls={showZoomControls}
        showFullscreenControl={showFullscreenControl}
        interactive={interactive}
        onMapReady={onMapReady}
      >
        {/* User GPS Dot & Accuracy Buffer on MapLibre Canvas (only active when GPS granted) */}
        <MapUserLocationMarker />

        {/* Top-Left: Category Filter Chips Overlay */}
        {showFilterChips && (
          <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-140px)] sm:max-w-none">
            <MapFilterChips
              options={DEFAULT_MAP_FILTER_OPTIONS}
              selectedId={selectedFilter}
              onSelect={handleFilterSelect}
            />
          </div>
        )}

        {/* Top-Left Sub-bar: Rebalanced Location Status Badge & Weather Badge (No presets) */}
        <div className="absolute top-14 left-3 z-10 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-80px)]">
          {showLocationBadge && (
            <MapLocationStatusBadge
              onClickChange={() => setIsLocationDialogOpen(true)}
            />
          )}

          {showWeatherBadge && (
            <WeatherCompactBadge
              weather={weather}
              isLoading={isWeatherLoading}
            />
          )}
        </div>

        {/* Bottom-Left: Map Legend Overlay */}
        {showLegend && <MapLegend />}

        {/* Bottom-Right: Locate / Geolocation Button & Navigation Controls */}
        <MapBottomRightControls
          onLocationDenied={() => setShowDeniedNotice(true)}
          showZoomControls={showZoomControls}
          showFullscreenControl={showFullscreenControl}
        />

        {/* Non-Blocking Permission Denied Notification Banner */}
        {showDeniedNotice && (
          <div
            role="status"
            aria-live="polite"
            className="absolute bottom-24 right-3 left-3 sm:left-auto sm:max-w-sm z-30 flex items-start gap-2.5 rounded-xl border border-border/80 bg-background/95 p-3 text-xs shadow-lg backdrop-blur"
          >
            <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-foreground">Location Access Denied</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Map remains fully usable. You can search and set your city or region manually.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    setShowDeniedNotice(false);
                    setIsLocationDialogOpen(true);
                  }}
                >
                  <MapPin className="h-3 w-3" />
                  Select City
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => setShowDeniedNotice(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Nested Children (e.g. Unified Disaster Layer, GIS Toolbar, GIS Legend) */}
        {children}
      </DynamicMapContainer>

      {/* Manual Region / City Search Dialog */}
      <LocationSearchDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        onLocationSelected={() => {
          setShowDeniedNotice(false);
          if (mapContext) {
            mapContext.flyTo([location.longitude, location.latitude], 11);
          }
        }}
      />
    </div>
  );
}

export function MapView(props: MapViewProps) {
  return (
    <MapProvider
      initialCenter={props.initialCenter || DEFAULT_MAP_CENTER}
      initialZoom={props.initialZoom || DEFAULT_MAP_ZOOM}
    >
      <MapViewInternal {...props} />
    </MapProvider>
  );
}
