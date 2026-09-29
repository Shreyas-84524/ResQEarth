import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Map,
  Flame,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RouteContainer } from "@/components/layout/route-container";

export default function HomePage() {
  return (
    <RouteContainer>
      <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 lg:py-20 space-y-6 max-w-3xl mx-auto">
        {/* Academic Context Badge */}
        <Badge variant="outline" className="text-xs px-3 py-1 gap-1.5 border-primary/30 bg-primary/5 text-primary">
          <ShieldAlert className="h-3.5 w-3.5" />
          Second-Year Engineering ESE Mini Project
        </Badge>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Smart Disaster Intelligence & Emergency Warning
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          An integrated environmental monitoring, geospatial disaster mapping, explainable risk assessment, and consent-based emergency warning platform.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button size="lg" asChild className="gap-2">
            <Link href="/map">
              <Map className="h-4 w-4" />
              Explore Live Map
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="gap-2">
            <Link href="/disasters">
              <Flame className="h-4 w-4" />
              Disaster Preparedness
            </Link>
          </Button>
        </div>

        {/* Quick Feature Grid Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left w-full">
          <div className="rounded-lg border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-3">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Geospatial Awareness</h3>
            <p className="text-xs text-muted-foreground">
              MapLibre OpenStreetMap visualization for earthquakes, floods, wildfires, and severe storms.
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 mb-3">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Explainable Risk</h3>
            <p className="text-xs text-muted-foreground">
              Deterministic 0–100 risk scores with transparent contributing factors and safety indicators.
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 mb-3">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">Government Alignment</h3>
            <p className="text-xs text-muted-foreground">
              Integrated with verified NDMA, IMD, NDRF, and CWC institutional response guidance.
            </p>
          </div>
        </div>
      </div>
    </RouteContainer>
  );
}
