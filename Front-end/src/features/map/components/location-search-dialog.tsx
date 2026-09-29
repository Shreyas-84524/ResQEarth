"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useGeolocation } from "../hooks/use-geolocation";
import { PRESET_INDIAN_CITIES } from "../constants/geolocation-defaults";
import type { ManualCityPreset } from "../types/geolocation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Navigation,
  MapPin,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Compass,
} from "lucide-react";

export interface LocationSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelected?: () => void;
}

export function LocationSearchDialog({
  open,
  onOpenChange,
  onLocationSelected,
}: LocationSearchDialogProps) {
  const {
    location,
    isLocating,
    isGeocoding,
    error,
    requestGpsLocation,
    setManualLocation,
    resetToDefault,
  } = useGeolocation();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [customLat, setCustomLat] = React.useState("");
  const [customLng, setCustomLng] = React.useState("");
  const [customError, setCustomError] = React.useState<string | null>(null);

  // Filter preset cities based on search
  const filteredCities = React.useMemo(() => {
    if (!searchQuery.trim()) return PRESET_INDIAN_CITIES;
    const q = searchQuery.toLowerCase().trim();
    return PRESET_INDIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        (c.primaryHazard && c.primaryHazard.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleUseGps = async () => {
    const result = await requestGpsLocation();
    if (result) {
      if (onLocationSelected) onLocationSelected();
      onOpenChange(false);
    }
  };

  const handleSelectCity = async (city: ManualCityPreset) => {
    await setManualLocation(city);
    if (onLocationSelected) onLocationSelected();
    onOpenChange(false);
  };

  const handleCustomCoordinatesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || isNaN(lng)) {
      setCustomError("Please enter valid numerical coordinates.");
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCustomError("Latitude must be between -90 and 90; Longitude between -180 and 180.");
      return;
    }

    await setManualLocation({ lat, lng });
    if (onLocationSelected) onLocationSelected();
    onOpenChange(false);
  };

  const handleReset = () => {
    resetToDefault();
    if (onLocationSelected) onLocationSelected();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Compass className="h-5 w-5 text-primary" />
            Set Surveillance Region
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select your location using browser GPS, choose from high-risk Indian regional presets, or input manual coordinates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Current Active Location Summary */}
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Currently Selected:</span>
              <Badge
                variant={location.source === "gps" ? "default" : "secondary"}
                className="text-[10px] uppercase font-mono"
              >
                {location.source}
              </Badge>
            </div>
            <p className="font-semibold text-foreground text-sm">
              {location.locality}, {location.city}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E &bull; {location.state}
            </p>
          </div>

          {/* 1. Request GPS Button */}
          <Button
            type="button"
            onClick={handleUseGps}
            disabled={isLocating || isGeocoding}
            className="w-full gap-2 text-xs h-10 shadow-sm"
          >
            {isLocating || isGeocoding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resolving GPS Location & Address...</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 text-emerald-400" />
                <span>Use Current Device GPS Location</span>
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
            <span className="relative bg-background px-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Or Select Indian City / District
            </span>
          </div>

          {/* 2. Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by city, district, state, or hazard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          {/* Cities List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
            {filteredCities.map((city) => {
              const isSelected =
                Math.abs(city.coordinates[1] - location.latitude) < 0.05 &&
                Math.abs(city.coordinates[0] - location.longitude) < 0.05;

              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={cn(
                    "flex flex-col items-start p-2.5 rounded-lg border text-left transition-all text-xs",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/80 hover:border-primary/40 hover:bg-muted/40 text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      {city.name}
                    </span>
                    {city.isHighRiskZone && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-destructive/10 text-destructive font-mono font-medium">
                        Hazard Zone
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {city.district}, {city.state}
                  </span>
                  {city.primaryHazard && (
                    <span className="text-[9px] text-muted-foreground/80 mt-1 line-clamp-1 italic">
                      {city.primaryHazard}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. Manual Coordinate Input Accordion/Box */}
          <div className="rounded-lg border border-border/80 p-3 bg-muted/10 space-y-2">
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              Custom Coordinates (WGS84)
            </span>
            <form onSubmit={handleCustomCoordinatesSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude (e.g. 19.0760)"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="text-xs h-8"
                />
                <Input
                  placeholder="Longitude (e.g. 72.8777)"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              {customError && (
                <p className="text-[10px] text-destructive">{customError}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs h-7 gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Default (Mumbai)
                </Button>
                <Button type="submit" size="sm" className="text-xs h-7">
                  Apply Coordinates
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
