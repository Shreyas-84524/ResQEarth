"use client";

import * as React from "react";
import Link from "next/link";
import maplibregl from "maplibre-gl";
import { useMap } from "@/features/map/hooks/use-map";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Badge } from "@/components/ui/badge";
import type { UnifiedDisasterEvent } from "../types/disaster-event";
import {
  Flame,
  Wind,
  Mountain,
  Waves,
  SunMedium,
  Activity,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Globe2,
} from "lucide-react";

export interface UnifiedDisasterPopupProps {
  disaster: UnifiedDisasterEvent;
  onClose: () => void;
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
  if (disasterType === "landslide") return "landslide";
  if (disasterType === "heat-wave" || disasterType === "cold-wave") return "heat-wave";
  if (disasterType === "chemical-leak") return "chemical-leak";
  return null;
}

export function UnifiedDisasterPopup({ disaster, onClose }: UnifiedDisasterPopupProps) {
  const { map } = useMap();
  const popupRef = React.useRef<maplibregl.Popup | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!map || !containerRef.current) return;

    // Create MapLibre HTML popup
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 18,
      maxWidth: "360px",
      className: "resqearth-disaster-popup",
    })
      .setLngLat([disaster.longitude, disaster.latitude])
      .setDOMContent(containerRef.current)
      .addTo(map);

    popupRef.current = popup;

    popup.on("close", () => {
      onClose();
    });

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [map, disaster, onClose]);

  const Icon = getCategoryIcon(disaster.categoryKey, disaster.disasterType);
  const guideSlug = getGuideSlug(disaster.disasterType);

  return (
    <div style={{ display: "none" }}>
      <div
        ref={containerRef}
        className="p-3 text-xs space-y-2.5 font-sans min-w-[280px] max-w-[340px] text-foreground bg-popover rounded-lg shadow-lg border border-border"
      >
        {/* 1. Header with Category & Provenance Badge */}
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-start gap-2">
            <div
              className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                disaster.isOfficialAlert
                  ? "bg-destructive/15 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {disaster.isOfficialAlert ? (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    OFFICIAL ALERT
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1">
                    <Radio className="h-2.5 w-2.5 text-primary" />
                    {disaster.sourceType === "official" ? "AGENCY FEED" : "AUTOMATIC TELEMETRY"}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {disaster.categoryTitle}
                </Badge>
              </div>
              <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 mt-1">
                {disaster.title}
              </h3>
            </div>
          </div>
          <SeverityBadge level={disaster.severity} size="sm" />
        </div>

        {/* 2. Description / Instructions */}
        {disaster.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
            {disaster.description}
          </p>
        )}

        {/* 3. Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2 rounded-md">
          {disaster.distanceKm !== undefined && (
            <div className="col-span-2 flex items-center justify-between border-b border-border/40 pb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> Distance to User:
              </span>
              <span className="font-mono font-bold text-foreground">
                {disaster.distanceKm.toLocaleString()} km
              </span>
            </div>
          )}

          {disaster.magnitudeValue !== undefined && disaster.magnitudeValue !== null && (
            <div>
              <span className="text-muted-foreground text-[10px] block">Magnitude</span>
              <span className="font-mono font-bold text-foreground text-xs mt-0.5 block">
                {disaster.magnitudeValue.toFixed(1)} {disaster.magnitudeUnit || "Mw"}
              </span>
            </div>
          )}

          {disaster.depthKm !== undefined && disaster.depthKm !== null && (
            <div>
              <span className="text-muted-foreground text-[10px] block">Focal Depth</span>
              <span className="font-mono text-foreground text-xs mt-0.5 block">
                {disaster.depthKm} km
              </span>
            </div>
          )}

          <div>
            <span className="text-muted-foreground text-[10px] block">Region / Area</span>
            <span className="font-medium text-foreground text-[11px] mt-0.5 block truncate">
              {disaster.region || "Unspecified"}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground text-[10px] block">Coordinates</span>
            <span className="font-mono text-foreground text-[10px] mt-0.5 block">
              {disaster.latitude.toFixed(2)}°, {disaster.longitude.toFixed(2)}°
            </span>
          </div>

          <div className="col-span-2 flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(disaster.occurredAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="font-medium">{disaster.sourceName}</span>
          </div>
        </div>

        {/* 4. Action Links & Safety Guides */}
        <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/60">
          <a
            href={disaster.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Source Portal</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {guideSlug && (
            <Link
              href={`/disasters/${guideSlug}`}
              className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Safety Guide <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
