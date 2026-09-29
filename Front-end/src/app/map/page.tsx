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
} from "@/features/disasters";
import {
  Compass,
  Layers,
  MapPin,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Activity,
} from "lucide-react";

function MapPageContent() {
  const {
    earthquakes,
    geoJson,
    selectedEarthquake,
    setSelectedEarthquake,
    feedType,
    setFeedType,
    minMagnitude,
    setMinMagnitude,
    searchQuery,
    setSearchQuery,
    isLoading: isEarthquakesLoading,
    error: earthquakesError,
    isStale: isEarthquakesStale,
    refresh: refreshEarthquakes,
  } = useEarthquakes();

  const handleSelectEarthquake = (eq: NormalizedEarthquake | null) => {
    setSelectedEarthquake(eq);
  };

  return (
    <RouteContainer size="lg" className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Interactive GIS Disaster Map"
        description="High-performance MapLibre vector surveillance map with real-time USGS earthquake layers, multi-hazard clustering, and OpenStreetMap basemap."
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              MapLibre GL JS 5.2
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              <Activity className="h-3 w-3 mr-1 text-destructive" />
              USGS Live Quakes ({earthquakes.length})
            </Badge>
          </div>
        }
      />

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
              geoJson={geoJson}
              earthquakes={earthquakes}
              selectedEarthquake={selectedEarthquake}
              onSelectEarthquake={handleSelectEarthquake}
              visible={true}
            />
          </MapView>
        </div>

        {/* Live Earthquake Intelligence Panel (1 Column on Large Screens) */}
        <div className="h-[520px] sm:h-[580px] lg:h-[640px] flex flex-col">
          <EarthquakeListPanel
            earthquakes={earthquakes}
            isLoading={isEarthquakesLoading}
            error={earthquakesError}
            isStale={isEarthquakesStale}
            feedType={feedType}
            onFeedTypeChange={setFeedType}
            minMagnitude={minMagnitude}
            onMinMagnitudeChange={setMinMagnitude}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSelectEarthquake={handleSelectEarthquake}
            onRefresh={refreshEarthquakes}
            selectedEarthquakeId={selectedEarthquake?.id}
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
            contributors. Earthquakes feed provided by USGS. Powered by MapLibre GL JS.
          </span>
        </div>
        <div className="text-[11px] font-mono">
          CRS: WGS84 (Lat/Lon) &bull; USGS Real-Time Engine Active
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
