"use client";

import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
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
import {
  Compass,
  Layers,
  MapPin,
  ShieldAlert,
  Smartphone,
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
    <RouteContainer size="lg" className="space-y-7 pb-12">
      <section className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
            <Radio className="h-3.5 w-3.5" /> Live geospatial workspace
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">Multi-hazard map</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">A unified operational view of active hazards from verified global and Indian public sources.</p>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <MapStat label="Signals" value={disasters.length} />
          <MapStat label="Official" value={officialCount} />
          <MapStat label="Critical" value={criticalCount} alert={criticalCount > 0} />
        </div>
      </section>

      {/* 2. Interactive Map & Live Unified Feed Grid */}
      <div className="grid grid-cols-1 gap-5 items-start lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Interactive MapLibre GIS Container (2 Columns on Large Screens) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-[0_16px_50px_rgba(15,23,42,.12)]">
          <MapView
            className="h-[540px] sm:h-[600px] lg:h-[680px] w-full rounded-none overflow-hidden border-0 shadow-none"
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
        <div className="h-[540px] sm:h-[600px] lg:h-[680px] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
      <div className="grid grid-cols-1 border-y border-slate-200 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none border-0 bg-transparent shadow-none lg:border-r lg:border-slate-200">
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

        <Card className="rounded-none border-0 bg-transparent shadow-none lg:border-r lg:border-slate-200">
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

        <Card className="rounded-none border-0 bg-transparent shadow-none lg:border-r lg:border-slate-200">
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

        <Card className="rounded-none border-0 bg-transparent shadow-none">
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

function MapStat({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return (
    <div className="min-w-[92px] border-r border-slate-200 px-4 py-3 text-center last:border-r-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={alert ? "mt-1 font-mono text-xl font-semibold text-red-600" : "mt-1 font-mono text-xl font-semibold text-slate-950"}>{value}</p>
    </div>
  );
}

export default function MapPage() {
  return (
    <LocationProvider>
      <MapPageContent />
    </LocationProvider>
  );
}
