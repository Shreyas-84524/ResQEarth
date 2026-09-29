import * as React from "react";
import { RouteContainer } from "@/components/layout/route-container";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapView } from "@/features/map";
import {
  Compass,
  Layers,
  MapPin,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";

export default function MapPage() {
  return (
    <RouteContainer size="lg" className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Interactive GIS Disaster Map"
        description="High-performance MapLibre vector surveillance map with multi-hazard layers, cluster aggregation, and OpenStreetMap basemap."
        badge={
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              MapLibre GL JS 5.2
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              EPSG:3857 / WGS84
            </Badge>
          </div>
        }
      />

      {/* 2. Interactive MapLibre GIS Container */}
      <div className="relative">
        <MapView
          className="h-[520px] sm:h-[600px] lg:h-[680px] w-full"
          showFilterChips={true}
          showRegionPicker={true}
          showLegend={true}
          showNavigationControls={true}
          showFullscreenControl={true}
          showScaleControl={true}
          showGeolocateControl={true}
        />
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
              <h4 className="text-sm font-semibold text-foreground">Mumbai & India Presets</h4>
              <p className="text-xs text-muted-foreground">
                Default Mumbai coordinate anchor with instant regional bounding box transitions.
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
              <h4 className="text-sm font-semibold text-foreground">Cluster & Heatmap Ready</h4>
              <p className="text-xs text-muted-foreground">
                Dynamic point aggregation and kernel density estimation for high event counts.
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
              <h4 className="text-sm font-semibold text-foreground">Mobile & Gesture Touch</h4>
              <p className="text-xs text-muted-foreground">
                Optimized for single-finger pan, two-finger pinch-zoom, and responsive container resizing.
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
            contributors. Powered by MapLibre GL JS.
          </span>
        </div>
        <div className="text-[11px] font-mono">
          CRS: WGS84 (Lat/Lon) &bull; MapLibre Engine Active
        </div>
      </div>
    </RouteContainer>
  );
}
