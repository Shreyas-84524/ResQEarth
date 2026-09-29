"use client";

import * as React from "react";
import {
  Info,
  X,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEVERITY_COLORS } from "@/features/map/constants/map-layers";

export interface MapGisLegendProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function MapGisLegend({ isOpen, onToggle, className }: MapGisLegendProps) {
  const [activeTab, setActiveTab] = React.useState<"severity" | "heatmap" | "provenance">("severity");

  if (!isOpen) {
    return (
      <div className={cn("absolute bottom-3 left-3 z-20", className)}>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background/90 text-xs font-semibold text-foreground backdrop-blur shadow-md hover:bg-muted transition-colors"
          aria-label="Open GIS Map Legend"
        >
          <Info className="h-3.5 w-3.5 text-primary" />
          <span>GIS Legend</span>
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute bottom-3 left-3 z-20 w-[300px] sm:w-[340px] rounded-xl border border-border/90 bg-background/95 p-3.5 backdrop-blur shadow-xl text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2",
        className
      )}
      role="region"
      aria-label="GIS Map Legend and Layer Explanation"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>GIS Multi-Hazard Legend</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Close Legend"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-muted/60 p-0.5 rounded-lg text-[11px] font-medium text-center">
        <button
          type="button"
          onClick={() => setActiveTab("severity")}
          className={cn(
            "py-1 rounded-md transition-all",
            activeTab === "severity"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Severity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("heatmap")}
          className={cn(
            "py-1 rounded-md transition-all",
            activeTab === "heatmap"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Heatmap
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("provenance")}
          className={cn(
            "py-1 rounded-md transition-all",
            activeTab === "provenance"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sources
        </button>
      </div>

      {/* Tab 1: Severity Scale */}
      {activeTab === "severity" && (
        <div className="space-y-2 text-[11px]">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">
            5-Tier Severity Classification
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS.CRITICAL }}
                />
                <strong className="text-foreground">Critical (81–100)</strong>
              </span>
              <span className="text-[10px] text-muted-foreground">Pulsing Shockwave</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS.HIGH }}
                />
                <strong className="text-foreground">High (61–80)</strong>
              </span>
              <span className="text-[10px] text-muted-foreground">Active Threat</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS.MODERATE }}
                />
                <span className="text-foreground">Moderate (41–60)</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Advisory</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS.GUARDED }}
                />
                <span className="text-foreground">Guarded (21–40)</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Monitoring</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS.LOW }}
                />
                <span className="text-foreground">Low (0–20)</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Minor</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Heatmap & Zoom Transitions */}
      {activeTab === "heatmap" && (
        <div className="space-y-2.5 text-[11px]">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
              <span>Low Density</span>
              <span>Extreme Concentration</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-[rgba(0,200,255,0.7)] via-[rgb(255,220,0)] to-[rgb(220,0,0)] border border-border/50 shadow-inner" />
          </div>

          <div className="space-y-1 text-muted-foreground leading-snug">
            <p>
              <strong className="text-foreground">Severity-Weighted:</strong> Critical and high events generate greater thermal intensity.
            </p>
            <p>
              <strong className="text-foreground">Zoom Transition:</strong> At broad zooms (&le; 6), the heatmap reveals regional disaster clusters. Zooming in smoothly unveils individual vector markers.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Provenance & Official Badges */}
      {activeTab === "provenance" && (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-start gap-2 p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="h-4 w-4 rounded-full border-2 border-amber-500 bg-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Official Statutory Alert</p>
              <p className="text-[10px] text-muted-foreground">
                Government warning with gold outer ring from NDMA SACHET / IMD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-1.5 rounded-lg bg-muted/50 border border-border/60">
            <div className="h-4 w-4 rounded-full border border-white bg-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Multi-Source Telemetry</p>
              <p className="text-[10px] text-muted-foreground">
                USGS Earthquakes, NASA EONET satellites, and Open-Meteo sensors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Transparency Notice */}
      <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground leading-tight italic">
        * Heatmap reflects incident density and severity for decision-support; not an official flood or evacuation zone boundary.
      </div>
    </div>
  );
}
