"use client";

import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapView, LocationProvider } from "@/features/map";
import {
  MapUnifiedDisasterLayer,
  UnifiedDisasterListPanel,
  MapGisToolbar,
  MapGisLegend,
  useUnifiedDisasters,
  type UnifiedDisasterEvent,
  type MapGisDisplayMode,
} from "@/features/disasters";
import { RiskBadge, useDisasterRisk } from "@/features/risk";
import {
  Compass,
  Layers,
  MapPin,
  ShieldAlert,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Radio,
  Waves,
  Wind,
  Activity,
  Flame,
} from "lucide-react";
import type { FilterChipOption } from "@/components/common/map-overlay";

function MapPageContent() {
  const [displayMode, setDisplayMode] = React.useState<MapGisDisplayMode>("all");
  const [isLegendOpen, setIsLegendOpen] = React.useState(false);

  const {
    disasters,
    filteredDisasters,
    geoJson,
    selectedDisaster,
    setSelectedDisaster,
    categoryFilter,
    setCategoryFilter,
    providerFilter,
    setProviderFilter,
    minSeverity,
    setMinSeverity,
    timeWindow,
    setTimeWindow,
    officialOnly,
    setOfficialOnly,
    searchQuery,
    setSearchQuery,
    categoryCounts,
    officialCount,
    criticalCount,
    isLoading,
    error,
    isStale,
    refresh,
  } = useUnifiedDisasters();

  const { assessment: riskAssessment } = useDisasterRisk();

  const handleSelectDisaster = React.useCallback(
    (disaster: UnifiedDisasterEvent | null) => {
      setSelectedDisaster(disaster);
    },
    [setSelectedDisaster]
  );

  // Synchronize Map Filter Chips with Unified Hazards categoryFilter
  const currentMapFilterId = React.useMemo(() => {
    switch (categoryFilter) {
      case "floods":
        return "flood";
      case "severeStorms":
        return "cyclone";
      case "earthquakes":
        return "earthquake";
      case "wildfires":
        return "wildfire";
      default:
        return "all";
    }
  }, [categoryFilter]);

  const handleMapFilterChange = React.useCallback(
    (filterId: string) => {
      switch (filterId) {
        case "flood":
          setCategoryFilter("floods");
          break;
        case "cyclone":
          setCategoryFilter("severeStorms");
          break;
        case "earthquake":
          setCategoryFilter("earthquakes");
          break;
        case "wildfire":
          setCategoryFilter("wildfires");
          break;
        case "all":
        default:
          setCategoryFilter("all");
          break;
      }
    },
    [setCategoryFilter]
  );

  const mapFilterOptions: FilterChipOption[] = React.useMemo(
    () => [
      { id: "all", label: "All Hazards", count: disasters.length },
      { id: "flood", label: "Floods", icon: Waves, count: categoryCounts.floods },
      { id: "cyclone", label: "Cyclones", icon: Wind, count: categoryCounts.severeStorms },
      { id: "earthquake", label: "Earthquakes", icon: Activity, count: categoryCounts.earthquakes },
      { id: "wildfire", label: "Wildfires", icon: Flame, count: categoryCounts.wildfires },
    ],
    [disasters.length, categoryCounts]
  );

  return (
    <RouteContainer size="lg" className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Interactive GIS Multi-Hazard Disaster Map"
        description="High-performance MapLibre vector GIS engine combining live USGS earthquakes, NASA EONET events, Open-Meteo severe weather, and Indian statutory NDMA SACHET / IMD alerts."
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              MapLibre GL JS 5.2
            </Badge>
            <RiskBadge
              score={riskAssessment.score}
              level={riskAssessment.level}
              size="sm"
            />
            <Badge variant="secondary" className="font-mono text-[10px]">
              <Radio className="h-3 w-3 mr-1 text-primary animate-pulse" />
              {disasters.length} Monitored Hazards
            </Badge>
            {officialCount > 0 && (
              <Badge variant="destructive" className="font-mono text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {officialCount} Official Indian Alerts
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge variant="destructive" className="font-mono text-[10px] bg-red-600">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
        }
      />

      {/* 2. Interactive Map & Live Unified Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive MapLibre GIS Container (2 Columns on Large Screens) */}
        <div className="relative lg:col-span-2">
          <MapView
            className="h-[540px] sm:h-[600px] lg:h-[660px] w-full rounded-xl overflow-hidden border border-border/80 shadow-sm"
            showFilterChips={true}
            filterOptions={mapFilterOptions}
            selectedFilter={currentMapFilterId}
            onFilterChange={handleMapFilterChange}
            showLocationBadge={true}
            showWeatherBadge={true}
            showLegend={false}
            showScaleControl={true}
            showZoomControls={true}
            showFullscreenControl={true}
          >
            {/* GIS Top-Right Quick Toolbar (Mode Switcher, Fit, Recenter, Legend) */}
            <MapGisToolbar
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              disasters={filteredDisasters}
              isLegendOpen={isLegendOpen}
              onToggleLegend={() => setIsLegendOpen((prev) => !prev)}
            />

            {/* Live Unified Multi-Hazard Layer (Heatmap + Pulsing Rings + Gold Official Rings + Markers) */}
            <MapUnifiedDisasterLayer
              geoJson={geoJson}
              disasters={filteredDisasters}
              selectedDisaster={selectedDisaster}
              onSelectDisaster={handleSelectDisaster}
              displayMode={displayMode}
              visible={true}
            />

            {/* Interactive Multi-Tab GIS Legend */}
            <MapGisLegend
              isOpen={isLegendOpen}
              onToggle={() => setIsLegendOpen((prev) => !prev)}
            />
          </MapView>
        </div>

        {/* Live Surveillance Panel (1 Column on Large Screens) */}
        <div className="h-[540px] sm:h-[600px] lg:h-[660px] flex flex-col">
          <UnifiedDisasterListPanel
            disasters={filteredDisasters}
            isLoading={isLoading}
            error={error}
            isStale={isStale}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            providerFilter={providerFilter}
            onProviderFilterChange={setProviderFilter}
            minSeverity={minSeverity}
            onMinSeverityChange={setMinSeverity}
            timeWindow={timeWindow}
            onTimeWindowChange={setTimeWindow}
            officialOnly={officialOnly}
            onOfficialOnlyChange={setOfficialOnly}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSelectDisaster={(d) => handleSelectDisaster(d)}
            onRefresh={refresh}
            selectedDisasterId={selectedDisaster?.id}
            categoryCounts={categoryCounts}
            className="h-full"
          />
        </div>
      </div>

      {/* 3. GIS Engine Capabilities & Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Card className="border-border/80">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Multi-Source Aggregation</h4>
              <p className="text-xs text-muted-foreground">
                Zero-crash concurrent ingestion across USGS, NASA EONET, Open-Meteo, NDMA SACHET, and IMD.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Spatial Deduplication</h4>
              <p className="text-xs text-muted-foreground">
                Auto-consolidation of overlapping reports within 15 km and 6 hours with authoritative provenance ranking.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Dynamic Vector Styling</h4>
              <p className="text-xs text-muted-foreground">
                Scaled circle radii, statutory gold rings for official alerts, and pulsing shockwaves for critical events.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-foreground">Mobile & Touch Ready</h4>
              <p className="text-xs text-muted-foreground">
                Optimized for touch gestures, popup inspections, and responsive container resizing down to 360 px.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Provenance & Attribution Disclaimer */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground border-t border-border/80 pt-4">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span>
            Basemap &copy;{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-foreground"
            >
              OpenStreetMap
            </a>{" "}
            contributors. Multi-hazard feeds provided by USGS, NASA EONET v3, NDMA SACHET, IMD, and Open-Meteo. Powered by MapLibre GL JS.
          </span>
        </div>
        <div className="text-[11px] font-mono">
          CRS: WGS84 (Lat/Lon) &bull; Multi-Hazard Telemetry Engine Active
        </div>
      </div>
    </RouteContainer>
  );
}

export default function MapPage() {
  return (
    <LocationProvider>
      <MapPageContent />
    </LocationProvider>
  );
}
