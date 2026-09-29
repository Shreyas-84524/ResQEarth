"use client";

import * as React from "react";
import Link from "next/link";
import maplibregl from "maplibre-gl";
import { useMap } from "@/features/map/hooks/use-map";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Badge } from "@/components/ui/badge";
import type { NormalizedGlobalDisaster } from "../types/global-disaster";
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
  Layers,
  Globe2,
} from "lucide-react";

export interface GlobalDisasterPopupProps {
  disaster: NormalizedGlobalDisaster;
  onClose: () => void;
}

function getDisasterCategoryIcon(categoryKey: string, disasterType: string) {
  if (categoryKey === "wildfires" || disasterType === "wildfire") return Flame;
  if (categoryKey === "severeStorms" || disasterType === "cyclone" || disasterType === "severe-storm") return Wind;
  if (categoryKey === "volcanoes" || disasterType === "volcano") return Mountain;
  if (categoryKey === "floods" || disasterType === "flood") return Waves;
  if (categoryKey === "landslides" || disasterType === "landslide") return Mountain;
  if (categoryKey === "tempExtremes" || disasterType === "extreme-temperature") return SunMedium;
  if (categoryKey === "earthquakes" || disasterType === "earthquake") return Activity;
  return Globe2;
}

function getGuideSlug(disasterType: string): string | null {
  if (disasterType === "flood") return "flood";
  if (disasterType === "cyclone" || disasterType === "severe-storm") return "cyclone";
  if (disasterType === "earthquake") return "earthquake";
  if (disasterType === "landslide") return "landslide";
  return null;
}

export function GlobalDisasterPopup({ disaster, onClose }: GlobalDisasterPopupProps) {
  const { map } = useMap();
  const popupRef = React.useRef<maplibregl.Popup | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!map || !containerRef.current) return;

    // Create MapLibre HTML popup
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 16,
      maxWidth: "340px",
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

  const Icon = getDisasterCategoryIcon(disaster.categoryKey, disaster.disasterType);
  const guideSlug = getGuideSlug(disaster.disasterType);

  return (
    <div style={{ display: "none" }}>
      <div
        ref={containerRef}
        className="p-3 text-xs space-y-2.5 font-sans min-w-[260px] max-w-[320px] text-foreground bg-popover rounded-lg"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {disaster.categoryTitle}
                </Badge>
                {disaster.isOpen ? (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-emerald-600 dark:text-emerald-400">
                    Active Event
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                    Closed
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 mt-0.5">
                {disaster.title}
              </h3>
            </div>
          </div>
          <SeverityBadge level={disaster.severity} size="sm" />
        </div>

        {/* Description if present */}
        {disaster.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {disaster.description}
          </p>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2 rounded-md">
          {disaster.distanceKm !== undefined && (
            <div className="col-span-2 flex items-center justify-between border-b border-border/40 pb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> Proximity to You:
              </span>
              <span className="font-mono font-bold text-foreground">
                {disaster.distanceKm.toLocaleString()} km
              </span>
            </div>
          )}

          <div>
            <span className="text-muted-foreground text-[10px] block">Geometry</span>
            <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
              <Layers className="h-3 w-3 text-muted-foreground" />
              {disaster.geometryType}
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
              Observed: {new Date(disaster.occurredAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Action Links & Provenance */}
        <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/60">
          <a
            href={disaster.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>{disaster.primarySource.name}</span>
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
