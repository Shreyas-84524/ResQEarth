"use client";

import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapView, LocationProvider } from "@/features/map";
import {
  MapEarthquakeLayer,
  EarthquakeListPanel,
  useEarthquakes,
  type NormalizedEarthquake,
  MapGlobalDisasterLayer,
  GlobalDisasterListPanel,
  useGlobalDisasters,
  type NormalizedGlobalDisaster,
} from "@/features/disasters";
import {
  Compass,
  Layers,
  MapPin,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Activity,
  Globe2,
} from "lucide-react";

function MapPageContent() {
  const [activeListTab, setActiveListTab] = React.useState<"earthquakes" | "global">("earthquakes");
  const [activeLayerFilter, setActiveLayerFilter] = React.useState<"all" | "earthquakes" | "global">("all");

  const {
    earthquakes,
    geoJson: earthquakeGeoJson,
    selectedEarthquake,
    setSelectedEarthquake,
    feedType,
    setFeedType,
    minMagnitude,
    setMinMagnitude,
    searchQuery: earthquakeSearch,
    setSearchQuery: setEarthquakeSearch,
    isLoading: isEarthquakesLoading,
    error: earthquakesError,
    isStale: isEarthquakesStale,
    refresh: refreshEarthquakes,
  } = useEarthquakes();

  const {
    disasters: globalDisasters,
    geoJson: globalGeoJson,
    selectedDisaster: selectedGlobalDisaster,
    setSelectedDisaster: setSelectedGlobalDisaster,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    searchQuery: globalSearch,
    setSearchQuery: setGlobalSearch,
    categoryCounts,
    isLoading: isGlobalLoading,
    error: globalError,
    isStale: isGlobalStale,
    refresh: refreshGlobalDisasters,
  } = useGlobalDisasters();

  const handleSelectEarthquake = (eq: NormalizedEarthquake | null) => {
    setSelectedEarthquake(eq);
    if (eq) {
      setSelectedGlobalDisaster(null);
      setActiveListTab("earthquakes");
    }
  };

  const handleSelectGlobalDisaster = (d: NormalizedGlobalDisaster | null) => {
    setSelectedGlobalDisaster(d);
    if (d) {
      setSelectedEarthquake(null);
      setActiveListTab("global");
    }
  };

  return (
    <RouteContainer size="lg" className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Interactive GIS Disaster Map"
        description="High-performance MapLibre vector surveillance map with real-time USGS earthquake feeds, NASA EONET global events, and OpenStreetMap basemap."
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              MapLibre GL JS 5.2
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              <Activity className="h-3 w-3 mr-1 text-destructive" />
              USGS Earthquakes ({earthquakes.length})
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              <Globe2 className="h-3 w-3 mr-1 text-blue-500" />
              NASA EONET Events ({globalDisasters.length})
            </Badge>
          </div>
        }
      />

      {/* Layer Visibility Mode Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground px-2 flex items-center gap-1">
            <Layers className="h-3 w-3 text-primary" /> Map Layers:
          </span>
          <button
            type="button"
            onClick={() => setActiveLayerFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeLayerFilter === "all"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Hazards ({earthquakes.length + globalDisasters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerFilter("earthquakes")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeLayerFilter === "earthquakes"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USGS Quakes ({earthquakes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerFilter("global")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activeLayerFilter === "global"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            NASA Events ({globalDisasters.length})
          </button>
        </div>

        {/* List Switcher Tab */}
        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-md border border-border/40 text-xs">
          <button
            type="button"
            onClick={() => setActiveListTab("earthquakes")}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeListTab === "earthquakes"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Earthquakes List
          </button>
          <button
            type="button"
            onClick={() => setActiveListTab("global")}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeListTab === "global"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            NASA EONET List
          </button>
        </div>
      </div>

      {/* 2. Interactive Map & Live Seismic Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Interactive MapLibre GIS Container (2 Columns on Large Screens) */}
        <div className="relative lg:col-span-2">
          <MapView
            className="h-[520px] sm:h-[580px] lg:h-[640px] w-full rounded-xl overflow-hidden border border-border/80 shadow-sm"
            showFilterChips={true}
            showRegionPicker={true}
            showLocationBadge={true}
            showWeatherBadge={true}
            showLegend={true}
            showNavigationControls={true}
            showFullscreenControl={true}
            showScaleControl={true}
            showGeolocateControl={true}
          >
            {/* Live USGS Earthquake Marker & Pulse Layers */}
            <MapEarthquakeLayer
              geoJson={earthquakeGeoJson}
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onSelectEarthquake={handleSelectEarthquake}
              visible={activeLayerFilter === "all" || activeLayerFilter === "earthquakes"}
            />

            {/* Live NASA EONET Global Disaster Events Layer */}
            <MapGlobalDisasterLayer
              geoJson={globalGeoJson}
              disasters={globalDisasters}
              selectedDisaster={selectedGlobalDisaster}
              onSelectDisaster={handleSelectGlobalDisaster}
              visible={activeLayerFilter === "all" || activeLayerFilter === "global"}
            />
          </MapView>
        </div>

        {/* Live Surveillance Panel (1 Column on Large Screens) */}
        <div className="h-[520px] sm:h-[580px] lg:h-[640px] flex flex-col">
          {activeListTab === "earthquakes" ? (
            <EarthquakeListPanel
              earthquakes={earthquakes}
              isLoading={isEarthquakesLoading}
              error={earthquakesError}
              isStale={isEarthquakesStale}
              feedType={feedType}
              onFeedTypeChange={setFeedType}
              minMagnitude={minMagnitude}
              onMinMagnitudeChange={setMinMagnitude}
              searchQuery={earthquakeSearch}
              onSearchQueryChange={setEarthquakeSearch}
              onSelectEarthquake={handleSelectEarthquake}
              onRefresh={refreshEarthquakes}
              selectedEarthquakeId={selectedEarthquake?.id}
              className="h-full"
            />
          ) : (
            <GlobalDisasterListPanel
              disasters={globalDisasters}
              isLoading={isGlobalLoading}
              error={globalError}
              isStale={isGlobalStale}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={globalSearch}
              onSearchQueryChange={setGlobalSearch}
              onSelectDisaster={handleSelectGlobalDisaster}
              onRefresh={refreshGlobalDisasters}
              selectedDisasterId={selectedGlobalDisaster?.id}
              categoryCounts={categoryCounts}
              className="h-full"
            />
          )}
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
              <h4 className="text-sm font-semibold text-foreground">Vector GIS Canvas</h4>
              <p className="text-xs text-muted-foreground">
                60 FPS WebGL rendering with pan, pinch-zoom, pitch tilt, and rotation.
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
              <h4 className="text-sm font-semibold text-foreground">Live Geolocation</h4>
              <p className="text-xs text-muted-foreground">
                GPS centering with dynamic Haversine distance calculations to seismic events.
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
              <h4 className="text-sm font-semibold text-foreground">Dynamic Marker Scaling</h4>
              <p className="text-xs text-muted-foreground">
                Circle radii and pulsing shockwave rings scaled by Richter/Moment magnitude.
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
                Optimized for touch gestures, popup inspections, and responsive container resizing.
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
            Basemap imagery &copy;{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-foreground"
            >
              OpenStreetMap
            </a>{" "}
            contributors. Earthquakes feed provided by USGS. Global disaster events provided by NASA EONET v3. Powered by MapLibre GL JS.
          </span>
        </div>
        <div className="text-[11px] font-mono">
          CRS: WGS84 (Lat/Lon) &bull; USGS & NASA Real-Time Feeds Active
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
