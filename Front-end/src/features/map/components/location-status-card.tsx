"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useGeolocation } from "../hooks/use-geolocation";
import { LocationSearchDialog } from "./location-search-dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Globe,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";

export interface LocationStatusCardProps {
  className?: string;
}

export function LocationStatusCard({ className }: LocationStatusCardProps) {
  const { location } = useGeolocation();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const SourceIcon =
    location.source === "gps"
      ? Navigation
      : location.source === "manual"
      ? MapPin
      : Globe;

  const sourceBadgeVariant =
    location.source === "gps"
      ? "default"
      : location.source === "manual"
      ? "secondary"
      : "outline";

  return (
    <>
      <Card className={cn("border-border/80 shadow-sm", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SourceIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  Surveillance Location Telemetry
                </CardTitle>
                <CardDescription className="text-xs">
                  Active coordinate anchor for local hazard detection and risk evaluation.
                </CardDescription>
              </div>
            </div>

            <Badge variant={sourceBadgeVariant} className="text-[10px] uppercase font-mono">
              {location.source === "gps" && "GPS High-Precision"}
              {location.source === "manual" && "Manual Selection"}
              {location.source === "fallback" && "Default Fallback"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-sm">
                  {location.locality || location.city}
                </span>
                <span className="text-muted-foreground text-xs">&bull;</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {location.district}, {location.state}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-[11px] text-muted-foreground font-mono">
                <span>
                  {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                </span>
                {location.accuracyMeters && (
                  <>
                    <span>&bull;</span>
                    <span>Accuracy: ±{Math.round(location.accuracyMeters)}m</span>
                  </>
                )}
                <span>&bull;</span>
                <span>Country: {location.country}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="gap-1.5 text-xs h-8"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Change Region
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>OSM Nominatim Reverse-Geocoding Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Session Persistent &bull; Zero Firebase Dependency</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <LocationSearchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
