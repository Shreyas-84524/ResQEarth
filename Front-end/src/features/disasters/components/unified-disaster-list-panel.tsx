"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type {
  UnifiedDisasterEvent,
  UnifiedDisasterCategory,
  DisasterProvider,
  DisasterTimeWindow,
} from "../types/disaster-event";
import type { RiskLevel } from "@/types";
import {
  Activity,
  Flame,
  Wind,
  Mountain,
  Waves,
  SunMedium,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Radio,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  X,
  Globe2,
  ExternalLink,
} from "lucide-react";

export interface UnifiedDisasterListPanelProps {
  disasters: UnifiedDisasterEvent[];
  isLoading: boolean;
  error: string | null;
  isStale?: boolean;
  categoryFilter: UnifiedDisasterCategory;
  onCategoryFilterChange: (cat: UnifiedDisasterCategory) => void;
  providerFilter: DisasterProvider | "all";
  onProviderFilterChange: (prov: DisasterProvider | "all") => void;
  minSeverity: RiskLevel | "all";
  onMinSeverityChange: (sev: RiskLevel | "all") => void;
  timeWindow: DisasterTimeWindow;
  onTimeWindowChange: (tw: DisasterTimeWindow) => void;
  officialOnly: boolean;
  onOfficialOnlyChange: (val: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSelectDisaster: (disaster: UnifiedDisasterEvent) => void;
  onRefresh: () => void;
  selectedDisasterId?: string;
  categoryCounts: Record<UnifiedDisasterCategory, number>;
  className?: string;
}

const CATEGORY_TABS: Array<{ key: UnifiedDisasterCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "all", label: "All Hazards", icon: Globe2 },
  { key: "officialAlerts", label: "Official Alerts", icon: ShieldAlert },
  { key: "earthquakes", label: "Earthquakes", icon: Activity },
  { key: "severeStorms", label: "Storms & Cyclones", icon: Wind },
  { key: "wildfires", label: "Wildfires", icon: Flame },
  { key: "floods", label: "Floods", icon: Waves },
  { key: "landslides", label: "Landslides", icon: Mountain },
  { key: "weatherAlerts", label: "Weather Alerts", icon: SunMedium },
];

function getCategoryIcon(categoryKey: string, disasterType: string) {
  if (categoryKey === "earthquakes" || disasterType === "earthquake") return Activity;
  if (categoryKey === "wildfires" || disasterType === "wildfire") return Flame;
  if (categoryKey === "severeStorms" || disasterType === "cyclone" || disasterType === "severe-storm") return Wind;
  if (categoryKey === "floods" || disasterType === "flood" || disasterType === "urban-flood") return Waves;
  if (categoryKey === "landslides" || disasterType === "landslide") return Mountain;
  if (categoryKey === "weatherAlerts" || disasterType === "heat-wave" || disasterType === "cold-wave") return SunMedium;
  if (categoryKey === "officialAlerts") return ShieldAlert;
  return Globe2;
}

export function UnifiedDisasterListPanel({
  disasters,
  isLoading,
  error,
  isStale,
  categoryFilter,
  onCategoryFilterChange,
  providerFilter,
  onProviderFilterChange,
  minSeverity,
  onMinSeverityChange,
  timeWindow,
  onTimeWindowChange,
  officialOnly,
  onOfficialOnlyChange,
  searchQuery,
  onSearchQueryChange,
  onSelectDisaster,
  onRefresh,
  selectedDisasterId,
  categoryCounts,
  className = "",
}: UnifiedDisasterListPanelProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const itemRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    if (!selectedDisasterId) return;
    const el = itemRefs.current.get(selectedDisasterId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedDisasterId]);

  return (
    <Card className={`flex flex-col h-full border-border/80 shadow-sm ${className}`}>
      {/* 1. Header & Live Indicator */}
      <CardHeader className="p-4 pb-3 border-b border-border/60">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-base font-bold text-foreground">
                Unified Hazard Feed
              </CardTitle>
              {isStale && (
                <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                  Cached
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {disasters.length} active multi-hazard feeds &bull; Auto-refreshes every 6h
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              title="Toggle Advanced Filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Feeds"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2.5">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search hazard, region, or source..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs bg-muted/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-1 scrollbar-thin text-xs">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = categoryCounts[tab.key] ?? 0;
            const isActive = categoryFilter === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onCategoryFilterChange(tab.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/50 hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1 text-[9px] font-mono ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {/* Provider Filter */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                  Data Provider
                </label>
                <select
                  aria-label="Data Provider Filter"
                  value={providerFilter}
                  onChange={(e) => onProviderFilterChange(e.target.value as DisasterProvider | "all")}
                  className="w-full h-7 rounded border border-border bg-background px-2 text-xs text-foreground"
                >
                  <option value="all">All Providers</option>
                  <option value="usgs">USGS Earthquakes</option>
                  <option value="nasa-eonet">NASA EONET</option>
                  <option value="ndma-sachet">NDMA SACHET (India)</option>
                  <option value="imd">IMD (India)</option>
                  <option value="open-meteo">Open-Meteo Weather</option>
                </select>
              </div>

              {/* Min Severity Filter */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                  Min Severity
                </label>
                <select
                  aria-label="Minimum Severity Filter"
                  value={minSeverity}
                  onChange={(e) => onMinSeverityChange(e.target.value as RiskLevel | "all")}
                  className="w-full h-7 rounded border border-border bg-background px-2 text-xs text-foreground"
                >
                  <option value="all">All Severities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High & Above</option>
                  <option value="MODERATE">Moderate & Above</option>
                  <option value="GUARDED">Guarded & Above</option>
                </select>
              </div>

              {/* Time Window Filter */}
              <div>
                <label className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                  Time Horizon
                </label>
                <select
                  aria-label="Time Horizon Filter"
                  value={timeWindow}
                  onChange={(e) => onTimeWindowChange(e.target.value as DisasterTimeWindow)}
                  className="w-full h-7 rounded border border-border bg-background px-2 text-xs text-foreground"
                >
                  <option value="all">All Recorded</option>
                  <option value="1h">Past 1 Hour</option>
                  <option value="24h">Past 24 Hours</option>
                  <option value="48h">Past 48 Hours</option>
                  <option value="7d">Past 7 Days</option>
                </select>
              </div>

              {/* Official Alert Only Toggle */}
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={officialOnly}
                    onChange={(e) => onOfficialOnlyChange(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span>Official Alerts Only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* 2. Scrollable Disaster Event Feed */}
      <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading && disasters.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">Aggregating multi-source hazard telemetry...</p>
          </div>
        ) : error && disasters.length === 0 ? (
          <div className="p-6 text-center space-y-2 bg-destructive/10 rounded-lg m-2">
            <p className="text-xs font-semibold text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={onRefresh} className="text-xs">
              Retry
            </Button>
          </div>
        ) : disasters.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-muted-foreground">
            <Radio className="h-6 w-6 mx-auto text-muted-foreground/60" />
            <p className="text-xs font-semibold">No hazards match current filters.</p>
            <p className="text-[11px]">Try adjusting your search or category selection.</p>
          </div>
        ) : (
          disasters.map((event) => {
            const Icon = getCategoryIcon(event.categoryKey, event.disasterType);
            const isSelected = selectedDisasterId === event.id;

            return (
              <div
                key={event.id}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(event.id, el);
                  } else {
                    itemRefs.current.delete(event.id);
                  }
                }}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDisaster(event)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectDisaster(event);
                  }
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div
                      className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${
                        event.isOfficialAlert
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {event.isOfficialAlert ? (
                      <Badge variant="destructive" className="text-[9px] px-1 py-0 flex items-center gap-0.5 font-bold">
                        <ShieldCheck className="h-2 w-2" />
                        OFFICIAL
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                        {event.provider === "usgs" ? "USGS" : event.provider === "nasa-eonet" ? "NASA" : "WEATHER"}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {event.categoryTitle}
                    </span>
                  </div>
                  <SeverityBadge level={event.severity} size="sm" />
                </div>

                {/* Event Title */}
                <h4 className="font-bold text-xs text-foreground mt-1.5 line-clamp-2 leading-snug">
                  {event.title}
                </h4>

                {/* Footer Row: Distance & Timestamp */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    {event.distanceKm !== undefined ? (
                      <strong className="text-foreground">{event.distanceKm.toLocaleString()} km away</strong>
                    ) : (
                      <span>{event.region}</span>
                    )}
                  </span>

                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3 shrink-0" />
                    {new Date(event.occurredAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Verified Source Row */}
                {event.sourceUrl && (
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-border/30 text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                      Verified Source:
                    </span>
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline hover:text-primary/80 transition-colors truncate max-w-[170px]"
                      title={`Open official portal: ${event.sourceName}`}
                    >
                      <span className="truncate">{event.sourceName}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>

      {/* 3. Verified Official Data Sources Footer */}
      <div className="px-3 py-2 border-t border-border/60 bg-muted/20 text-[10px] text-muted-foreground flex items-center justify-between flex-wrap gap-1.5">
        <span className="flex items-center gap-1 font-semibold text-foreground/80">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          Verified Feeds:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://sachet.ndma.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline flex items-center gap-0.5"
          >
            NDMA SACHET <ExternalLink className="h-2 w-2" />
          </a>
          <span>&bull;</span>
          <a
            href="https://mausam.imd.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline flex items-center gap-0.5"
          >
            IMD <ExternalLink className="h-2 w-2" />
          </a>
          <span>&bull;</span>
          <a
            href="https://earthquake.usgs.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline flex items-center gap-0.5"
          >
            USGS <ExternalLink className="h-2 w-2" />
          </a>
          <span>&bull;</span>
          <a
            href="https://eonet.gsfc.nasa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline flex items-center gap-0.5"
          >
            NASA EONET <ExternalLink className="h-2 w-2" />
          </a>
        </div>
      </div>
    </Card>
  );
}
