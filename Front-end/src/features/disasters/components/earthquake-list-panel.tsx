"use client";

import * as React from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Clock,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  NormalizedEarthquake,
  EarthquakeFeedTimeWindow,
} from "../types/earthquake";

export interface EarthquakeListPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  earthquakes: NormalizedEarthquake[];
  isLoading?: boolean;
  error?: string | null;
  isStale?: boolean;
  feedType: EarthquakeFeedTimeWindow;
  onFeedTypeChange: (feed: EarthquakeFeedTimeWindow) => void;
  minMagnitude: number;
  onMinMagnitudeChange: (mag: number) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSelectEarthquake?: (eq: NormalizedEarthquake) => void;
  onRefresh?: () => void;
  selectedEarthquakeId?: string;
}

const MAGNITUDE_FILTER_CHIPS = [
  { label: "All Events", min: 0 },
  { label: "M 2.5+", min: 2.5 },
  { label: "M 4.5+", min: 4.5 },
  { label: "M 6.0+ (Major)", min: 6.0 },
];

const TIME_WINDOW_OPTIONS: { id: EarthquakeFeedTimeWindow; label: string }[] = [
  { id: "hour", label: "Past Hour" },
  { id: "day_2.5", label: "Past 24h (M2.5+)" },
  { id: "day_all", label: "Past 24h (All)" },
  { id: "day_significant", label: "Significant Today" },
  { id: "week_all", label: "Past 7 Days" },
];

export function EarthquakeListPanel({
  earthquakes,
  isLoading = false,
  error,
  isStale = false,
  feedType,
  onFeedTypeChange,
  minMagnitude,
  onMinMagnitudeChange,
  searchQuery,
  onSearchQueryChange,
  onSelectEarthquake,
  onRefresh,
  selectedEarthquakeId,
  className,
  ...props
}: EarthquakeListPanelProps) {
  return (
    <Card className={cn("border-border/80 flex flex-col h-full", className)} {...props}>
      {/* 1. Header with Title & Refresh */}
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>USGS Live Earthquakes</span>
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                  {earthquakes.length} Events
                </Badge>
                {isStale && (
                  <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                    Stale Cache
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time seismic activity from USGS Earthquake Hazards Program.
              </CardDescription>
            </div>
          </div>

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Refresh earthquake feed"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
            </Button>
          )}
        </div>

        {/* Search & Feed Window Controls */}
        <div className="pt-2 space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by region, country, or place..."
              className="h-8 pl-8 text-xs bg-muted/30"
            />
          </div>

          {/* Time Window Dropdown / Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {TIME_WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFeedTypeChange(opt.id)}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors",
                  feedType === opt.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Magnitude Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" />
              Mag:
            </span>
            {MAGNITUDE_FILTER_CHIPS.map((chip) => (
              <button
                key={chip.min}
                type="button"
                onClick={() => onMinMagnitudeChange(chip.min)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors",
                  minMagnitude === chip.min
                    ? "bg-primary/10 border-primary/40 text-primary font-bold"
                    : "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* 2. Scrollable Earthquake List Content */}
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[420px] divide-y divide-border/40">
        {/* Loading Skeleton */}
        {isLoading && earthquakes.length === 0 && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && earthquakes.length === 0 && (
          <div className="p-6 text-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-xs font-semibold text-foreground">
              Unable to load earthquakes
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              {error}
            </p>
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={onRefresh} className="mt-2 text-xs">
                Retry Feed
              </Button>
            )}
          </div>
        )}

        {/* Empty Search / Filter Results */}
        {!isLoading && !error && earthquakes.length === 0 && (
          <div className="p-8 text-center space-y-1.5 text-muted-foreground">
            <Activity className="h-7 w-7 mx-auto opacity-40" />
            <p className="text-xs font-medium">No earthquakes match criteria</p>
            <p className="text-[11px]">
              Try adjusting your magnitude filter, time window, or search keyword.
            </p>
          </div>
        )}

        {/* Active List */}
        {earthquakes.map((eq) => {
          const isSelected = eq.id === selectedEarthquakeId;

          return (
            <div
              key={eq.id}
              onClick={() => onSelectEarthquake?.(eq)}
              className={cn(
                "p-3 transition-colors cursor-pointer hover:bg-muted/40 flex items-start gap-3",
                isSelected && "bg-primary/10 border-l-4 border-l-primary"
              )}
            >
              {/* Magnitude Indicator Box */}
              <div
                className={cn(
                  "h-10 w-11 rounded-lg flex flex-col items-center justify-center font-mono font-bold shrink-0 text-xs shadow-sm",
                  eq.severity === "CRITICAL" && "bg-red-600 text-white animate-pulse",
                  eq.severity === "HIGH" && "bg-orange-500 text-white",
                  eq.severity === "MODERATE" && "bg-amber-500 text-black dark:text-black",
                  eq.severity === "GUARDED" && "bg-sky-500 text-white",
                  eq.severity === "LOW" && "bg-emerald-600 text-white"
                )}
              >
                <span className="text-[9px] uppercase leading-none opacity-80">Mag</span>
                <span className="text-sm font-extrabold">{eq.magnitude.toFixed(1)}</span>
              </div>

              {/* Event Information */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                    {eq.place}
                  </h4>
                  <SeverityBadge level={eq.severity} size="sm" />
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                  <span>Depth: <strong className="font-mono text-foreground">{eq.depthKm}km</strong></span>
                  {eq.distanceKm !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <strong className="font-mono text-foreground">{eq.distanceKm.toLocaleString()} km</strong> away
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(eq.occurredAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {eq.tsunamiAlert && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                      Tsunami Alert
                    </Badge>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 self-center opacity-60" />
            </div>
          );
        })}
      </CardContent>

      {/* 3. Footer with USGS Attribution */}
      <div className="p-2.5 bg-muted/20 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between flex-wrap gap-1">
        <a
          href="https://earthquake.usgs.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline inline-flex items-center gap-1 text-primary font-medium"
        >
          <span>Source: USGS Earthquake Hazards Program</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
        <span>GeoJSON API Feed</span>
      </div>
    </Card>
  );
}
