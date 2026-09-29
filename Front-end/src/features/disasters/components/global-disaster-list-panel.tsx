"use client";

import * as React from "react";
import {
  Globe2,
  Flame,
  Wind,
  Mountain,
  Waves,
  SunMedium,
  Activity,
  Search,
  RefreshCw,
  Clock,
  ChevronRight,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  NormalizedGlobalDisaster,
  GlobalDisasterCategory,
} from "../types/global-disaster";

export interface GlobalDisasterListPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  disasters: NormalizedGlobalDisaster[];
  isLoading?: boolean;
  error?: string | null;
  isStale?: boolean;
  categoryFilter: GlobalDisasterCategory;
  onCategoryFilterChange: (cat: GlobalDisasterCategory) => void;
  statusFilter: "open" | "all";
  onStatusFilterChange: (status: "open" | "all") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSelectDisaster?: (disaster: NormalizedGlobalDisaster) => void;
  onRefresh?: () => void;
  selectedDisasterId?: string;
  categoryCounts?: Record<string, number>;
}

const CATEGORY_TABS: { id: GlobalDisasterCategory; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "All Hazards", icon: Globe2 },
  { id: "wildfires", label: "Wildfires", icon: Flame },
  { id: "severeStorms", label: "Storms & Cyclones", icon: Wind },
  { id: "volcanoes", label: "Volcanoes", icon: Mountain },
  { id: "floods", label: "Floods", icon: Waves },
  { id: "landslides", label: "Landslides", icon: Mountain },
];

function getCategoryIcon(catKey: string, disasterType: string): LucideIcon {
  if (catKey === "wildfires" || disasterType === "wildfire") return Flame;
  if (catKey === "severeStorms" || disasterType === "cyclone" || disasterType === "severe-storm") return Wind;
  if (catKey === "volcanoes" || disasterType === "volcano") return Mountain;
  if (catKey === "floods" || disasterType === "flood") return Waves;
  if (catKey === "landslides" || disasterType === "landslide") return Mountain;
  if (catKey === "tempExtremes" || disasterType === "extreme-temperature") return SunMedium;
  if (catKey === "earthquakes" || disasterType === "earthquake") return Activity;
  return Globe2;
}

export function GlobalDisasterListPanel({
  disasters,
  isLoading = false,
  error,
  isStale = false,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onSelectDisaster,
  onRefresh,
  selectedDisasterId,
  categoryCounts = {},
  className,
  ...props
}: GlobalDisasterListPanelProps) {
  return (
    <Card className={cn("border-border/80 flex flex-col h-full", className)} {...props}>
      {/* 1. Header with Title & Refresh */}
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>NASA EONET Events</span>
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                  {disasters.length} Events
                </Badge>
                {isStale && (
                  <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                    Stale Cache
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Global natural event intelligence tracked by NASA Earth Observatory.
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
              title="Refresh NASA global feed"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
            </Button>
          )}
        </div>

        {/* Search & Category Filter Chips */}
        <div className="pt-2 space-y-2">
          {/* Search Input & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Filter by storm name, fire, volcano, region..."
                className="h-8 pl-8 text-xs bg-muted/30"
              />
            </div>
            {statusFilter && onStatusFilterChange && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStatusFilterChange(statusFilter === "open" ? "all" : "open")}
                className="h-8 text-[11px] px-2 shrink-0"
                title="Toggle open vs all historical events"
              >
                {statusFilter === "open" ? "Active" : "All"}
              </Button>
            )}
          </div>

          {/* Category Tabs with Icons & Count Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = categoryCounts[tab.id] ?? 0;
              const isSelected = categoryFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onCategoryFilterChange(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1 rounded-full font-mono",
                        isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      {/* 2. Scrollable Disaster List */}
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && disasters.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : disasters.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-muted-foreground text-xs">
            <Globe2 className="h-8 w-8 mx-auto opacity-40 text-primary" />
            <p className="font-semibold text-foreground">No events match active criteria</p>
            <p className="text-[11px] max-w-xs mx-auto">
              Try choosing &quot;All Hazards&quot; or clearing your search term.
            </p>
          </div>
        ) : (
          disasters.map((item) => {
            const Icon = getCategoryIcon(item.categoryKey, item.disasterType);
            const isSelected = selectedDisasterId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectDisaster?.(item)}
                className={cn(
                  "group relative p-3 rounded-lg border transition-all cursor-pointer text-left space-y-1.5",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-md bg-muted text-foreground flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block truncate">
                        {item.categoryTitle}
                      </span>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <SeverityBadge level={item.severity} size="sm" />
                </div>

                {/* Metadata row */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.occurredAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span>&bull;</span>
                    <span className="truncate max-w-[100px]">{item.primarySource.name}</span>
                  </div>

                  {item.distanceKm !== undefined ? (
                    <span className="font-mono font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
                      {item.distanceKm.toLocaleString()} km
                    </span>
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
