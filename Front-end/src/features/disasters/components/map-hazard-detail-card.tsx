"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { UnifiedDisasterEvent } from "../types/disaster-event";
import {
  Activity,
  Flame,
  Wind,
  Mountain,
  Waves,
  SunMedium,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Globe2,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapHazardDetailCardProps {
  disaster: UnifiedDisasterEvent;
  overlappingHazards?: UnifiedDisasterEvent[];
  onSelectHazard?: (hazard: UnifiedDisasterEvent) => void;
  onClose: () => void;
  className?: string;
}

function getCategoryIcon(categoryKey: string, disasterType: string) {
  if (categoryKey === "earthquakes" || disasterType === "earthquake") return Activity;
  if (categoryKey === "wildfires" || disasterType === "wildfire") return Flame;
  if (categoryKey === "severeStorms" || disasterType === "cyclone" || disasterType === "severe-storm") return Wind;
  if (categoryKey === "floods" || disasterType === "flood" || disasterType === "urban-flood") return Waves;
  if (categoryKey === "landslides" || disasterType === "landslide") return Mountain;
  if (categoryKey === "volcanoes" || disasterType === "volcano") return Mountain;
  if (categoryKey === "weatherAlerts" || disasterType === "heat-wave" || disasterType === "cold-wave") return SunMedium;
  if (categoryKey === "officialAlerts") return ShieldAlert;
  return Globe2;
}

function getGuideSlug(disasterType: string): string | null {
  if (disasterType === "flood" || disasterType === "urban-flood") return "flood";
  if (disasterType === "cyclone" || disasterType === "severe-storm" || disasterType === "high-wind") return "cyclone";
  if (disasterType === "earthquake") return "earthquake";
  if (disasterType === "wildfire") return "wildfire";
  if (disasterType === "landslide") return "landslide";
  if (disasterType === "heat-wave" || disasterType === "cold-wave") return "heat-wave";
  if (disasterType === "chemical-leak") return "chemical-leak";
  return null;
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (Number.isNaN(diffMs)) return "";
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function MapHazardDetailCard({
  disaster,
  overlappingHazards = [],
  onSelectHazard,
  onClose,
  className = "",
}: MapHazardDetailCardProps) {
  const [showOverlapping, setShowOverlapping] = React.useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);

  const Icon = getCategoryIcon(disaster.categoryKey, disaster.disasterType);
  const guideSlug = getGuideSlug(disaster.disasterType);
  const timeAgo = formatTimeAgo(disaster.occurredAt);
  const formattedTime = formatDateTime(disaster.occurredAt);

  return (
    <div
      role="dialog"
      aria-label={`Hazard Details: ${disaster.title}`}
      className={cn(
        "absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto z-20 w-auto sm:w-[390px] max-w-[calc(100%-24px)] sm:max-w-[400px]",
        "bg-background/95 backdrop-blur-md rounded-2xl border border-border/80 shadow-2xl p-4 text-foreground",
        "transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-3 flex flex-col gap-3 max-h-[80vh] overflow-y-auto",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 1. Header: Icon, Category, Severity & Close Button */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
              disaster.isOfficialAlert
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/10 text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {disaster.categoryTitle}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <SeverityBadge level={disaster.severity} size="sm" />
              <Badge
                variant={disaster.isOpen ? "secondary" : "outline"}
                className="text-[10px] px-1.5 py-0 font-medium"
              >
                {disaster.isOpen ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Event
                  </span>
                ) : (
                  "Past Event"
                )}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground shrink-0"
          onClick={onClose}
          aria-label="Close hazard details card"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 2. Hazard Title & Provenance Badges */}
      <div className="space-y-1.5">
        <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug">
          {disaster.title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
          {disaster.isOfficialAlert ? (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-2.5 w-2.5" />
              OFFICIAL ALERT
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 text-primary" />
              {disaster.sourceType === "official" ? "AGENCY FEED" : "AUTOMATIC TELEMETRY"}
            </Badge>
          )}
          <span className="font-medium text-foreground">{disaster.sourceName}</span>
        </div>
      </div>

      {/* 3. Overlapping Hazards Banner (+X nearby hazards) */}
      {overlappingHazards.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>+{overlappingHazards.length} nearby hazard{overlappingHazards.length > 1 ? "s" : ""}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowOverlapping((prev) => !prev)}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {showOverlapping ? "Hide" : "Switch / View"}
              <ChevronDown
                className={cn("h-3 w-3 transition-transform duration-200", showOverlapping && "rotate-180")}
              />
            </button>
          </div>

          {showOverlapping && (
            <div className="space-y-1 pt-1.5 max-h-36 overflow-y-auto pr-0.5">
              {overlappingHazards.map((hazard) => (
                <button
                  key={hazard.id}
                  type="button"
                  onClick={() => onSelectHazard?.(hazard)}
                  className="w-full text-left p-1.5 rounded-lg bg-background/80 hover:bg-background border border-border/50 text-[11px] flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="truncate font-medium text-foreground">{hazard.title}</span>
                  </div>
                  <SeverityBadge level={hazard.severity} size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Description */}
      {disaster.description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {disaster.description}
        </p>
      )}

      {/* 5. Telemetry & Key Spatial Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-xl border border-border/50">
        {disaster.distanceKm !== undefined && (
          <div className="col-span-2 flex items-center justify-between border-b border-border/40 pb-1.5">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Distance to Location
            </span>
            <span className="font-mono font-bold text-foreground text-[11px]">
              {disaster.distanceKm.toLocaleString()} km
            </span>
          </div>
        )}

        <div>
          <span className="text-muted-foreground text-[10px] uppercase font-semibold block">
            Reported
          </span>
          <span className="font-medium text-foreground text-[11px] mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {formattedTime}
          </span>
          {timeAgo && (
            <span className="text-[10px] text-muted-foreground block">
              ({timeAgo})
            </span>
          )}
        </div>

        <div>
          <span className="text-muted-foreground text-[10px] uppercase font-semibold block">
            Region / Scope
          </span>
          <span className="font-medium text-foreground text-[11px] mt-0.5 block truncate" title={disaster.region}>
            {disaster.region || "Global Telemetry"}
          </span>
        </div>

        {disaster.magnitudeValue !== undefined && disaster.magnitudeValue !== null && (
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-semibold block">
              Magnitude
            </span>
            <span className="font-mono font-bold text-foreground text-xs mt-0.5 block">
              {disaster.magnitudeValue.toFixed(1)} {disaster.magnitudeUnit || "Mw"}
            </span>
          </div>
        )}

        {disaster.depthKm !== undefined && disaster.depthKm !== null && (
          <div>
            <span className="text-muted-foreground text-[10px] uppercase font-semibold block">
              Focal Depth
            </span>
            <span className="font-mono text-foreground text-xs mt-0.5 block">
              {disaster.depthKm} km
            </span>
          </div>
        )}
      </div>

      {/* 6. Expandable Technical Telemetry (View Details) */}
      <div className="border-t border-border/50 pt-2">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails((prev) => !prev)}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-muted-foreground hover:text-foreground py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3 text-primary" />
            {showTechnicalDetails ? "Hide Technical Details" : "View Technical Details"}
          </span>
          <ChevronDown
            className={cn("h-3 w-3 transition-transform duration-200", showTechnicalDetails && "rotate-180")}
          />
        </button>

        {showTechnicalDetails && (
          <div className="mt-2 space-y-1.5 p-2 rounded-lg bg-muted/30 text-[10px] font-mono border border-border/40 animate-in fade-in-0">
            {typeof disaster.latitude === "number" && typeof disaster.longitude === "number" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordinates:</span>
                <span className="font-semibold text-foreground">
                  {disaster.latitude.toFixed(4)}°, {disaster.longitude.toFixed(4)}°
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="text-foreground">{disaster.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event ID:</span>
              <span className="truncate max-w-[200px] text-foreground">{disaster.providerEventId}</span>
            </div>
            {disaster.severityScale && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scale:</span>
                <span className="text-foreground">{disaster.severityScale}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 7. Action Links: Safety Guide & Source Link */}
      <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
        <a
          href={disaster.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <span>Source Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        {guideSlug && (
          <Link
            href={`/disasters/${guideSlug}`}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>Safety Guide</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
