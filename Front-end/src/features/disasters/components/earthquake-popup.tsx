"use client";

import * as React from "react";
import Link from "next/link";
import maplibregl from "maplibre-gl";
import { useMap } from "@/features/map/hooks/use-map";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { NormalizedEarthquake } from "../types/earthquake";
import {
  Activity,
  MapPin,
  Clock,
  ExternalLink,
  Waves,
  Layers,
  ChevronRight,
} from "lucide-react";

export interface EarthquakePopupProps {
  earthquake: NormalizedEarthquake;
  onClose: () => void;
}

export function EarthquakePopup({ earthquake, onClose }: EarthquakePopupProps) {
  const { map } = useMap();
  const popupRef = React.useRef<maplibregl.Popup | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!map || !containerRef.current) return;

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "320px",
      offset: [0, -10],
      className: "resqearth-maplibre-popup",
    })
      .setLngLat([earthquake.longitude, earthquake.latitude])
      .setDOMContent(containerRef.current)
      .addTo(map);

    popup.on("close", onClose);
    popupRef.current = popup;

    return () => {
      popup.remove();
    };
  }, [map, earthquake, onClose]);

  return (
    <div className="hidden">
      <div
        ref={containerRef}
        className="p-3 text-xs space-y-3 font-sans text-foreground bg-popover rounded-lg"
      >
        {/* Header with Title and Magnitude Badge */}
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                USGS Seismic Event
              </span>
              <h4 className="text-xs font-bold text-foreground line-clamp-1">
                {earthquake.place}
              </h4>
            </div>
          </div>
          <SeverityBadge level={earthquake.severity} size="sm" />
        </div>

        {/* Magnitude & Depth Highlights */}
        <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2 rounded-md text-[11px]">
          <div>
            <span className="text-muted-foreground text-[10px]">Magnitude</span>
            <p className="font-mono font-bold text-foreground text-sm">
              M {earthquake.magnitude.toFixed(1)}
              <span className="text-[10px] font-normal text-muted-foreground ml-1">
                ({earthquake.magType.toUpperCase()})
              </span>
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px]">Focal Depth</span>
            <p className="font-mono font-bold text-foreground text-sm">
              {earthquake.depthKm} <span className="text-[10px] font-normal text-muted-foreground">km</span>
            </p>
          </div>
        </div>

        {/* Tsunami Alert Banner if Active */}
        {earthquake.tsunamiAlert && (
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-semibold">
            <Waves className="h-4 w-4 shrink-0 animate-pulse" />
            <span>Tsunami Advisory / Evaluation Active</span>
          </div>
        )}

        {/* Telemetry and Location Metadata */}
        <div className="space-y-1 text-muted-foreground text-[11px]">
          {earthquake.distanceKm !== undefined && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span>
                <strong>{earthquake.distanceKm.toLocaleString()} km</strong> from your location
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              {new Date(earthquake.occurredAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 shrink-0" />
            <span>
              Status: <strong className="capitalize">{earthquake.status}</strong>
              {earthquake.feltReports ? ` • ${earthquake.feltReports} felt reports` : ""}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-2">
          <a
            href={earthquake.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-0.5"
          >
            USGS Page
            <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
          </a>

          <Link
            href="/disasters/earthquake"
            className="text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-0.5"
          >
            Safety Guide
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
