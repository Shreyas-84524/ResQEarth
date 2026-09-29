"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { REGION_PRESETS } from "../constants/map-config";
import type { RegionPreset } from "../types/map";
import { MapPin, Globe } from "lucide-react";

export interface MapRegionPresetPickerProps {
  activeRegionId?: string;
  onSelectRegion: (preset: RegionPreset) => void;
  className?: string;
}

export function MapRegionPresetPicker({
  activeRegionId = "mumbai",
  onSelectRegion,
  className,
}: MapRegionPresetPickerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto p-1 no-scrollbar",
        className
      )}
      role="group"
      aria-label="Geographic region presets"
    >
      {REGION_PRESETS.map((preset) => {
        const isSelected = preset.id === activeRegionId;
        const Icon = preset.category === "national" ? Globe : MapPin;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectRegion(preset)}
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all shadow-sm",
              isSelected
                ? "bg-primary text-primary-foreground shadow"
                : "bg-background/90 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/80 backdrop-blur"
            )}
            title={preset.description}
          >
            <Icon className="h-3 w-3" />
            <span>{preset.name}</span>
          </button>
        );
      })}
    </div>
  );
}
