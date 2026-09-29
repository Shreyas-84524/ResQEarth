"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useGeolocation } from "../hooks/use-geolocation";
import {
  Navigation,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface MapLocationStatusBadgeProps {
  className?: string;
  onClickChange?: () => void;
}

export function MapLocationStatusBadge({
  className,
  onClickChange,
}: MapLocationStatusBadgeProps) {
  const { location, permission, isLocating, error } = useGeolocation();

  if (isLocating) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/95 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur",
          className
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Acquiring GPS Signal...</span>
      </div>
    );
  }

  if (permission === "denied" && location.source === "fallback") {
    return (
      <button
        type="button"
        onClick={onClickChange}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-background/95 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 shadow-sm backdrop-blur hover:bg-muted transition-all",
          className
        )}
        title={error || "Location permission denied. Click to set manually."}
      >
        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
        <span>GPS Denied &bull; Using Mumbai Fallback</span>
      </button>
    );
  }

  const SourceIcon =
    location.source === "gps"
      ? Navigation
      : location.source === "manual"
      ? MapPin
      : Globe;

  const sourceLabel =
    location.source === "gps"
      ? "GPS Verified"
      : location.source === "manual"
      ? "Manual Selection"
      : "Default Regional";

  return (
    <button
      type="button"
      onClick={onClickChange}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur hover:border-primary/40 hover:bg-muted transition-all",
        className
      )}
      title="Click to change location or view coordinates"
    >
      <SourceIcon
        className={cn(
          "h-3.5 w-3.5",
          location.source === "gps"
            ? "text-emerald-500"
            : location.source === "manual"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      />
      <span className="font-semibold">{location.city}</span>
      <span className="text-muted-foreground text-[10px]">({sourceLabel})</span>
    </button>
  );
}
