"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { UnifiedDisasterEvent } from "../types/disaster-event";
import {
  Globe2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  MapPin,
  ArrowRight,
  Map,
} from "lucide-react";

export interface UnifiedDisasterOverviewCardProps {
  disasters: UnifiedDisasterEvent[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  mostSevereDisaster?: UnifiedDisasterEvent | null;
  officialCount?: number;
  criticalCount?: number;
  className?: string;
}

export function UnifiedDisasterOverviewCard({
  disasters,
  isLoading,
  error,
  onRefresh,
  mostSevereDisaster,
  officialCount = 0,
  criticalCount = 0,
  className = "",
}: UnifiedDisasterOverviewCardProps) {
  return (
    <Card className={`border-border/80 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-destructive flex items-center justify-center">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Multi-Hazard Surveillance
              </CardTitle>
              <CardDescription className="text-xs">
                Aggregated feeds across USGS, NASA EONET, IMD & NDMA SACHET
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Hazards"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && disasters.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
            <p>Scanning global and regional surveillance feeds...</p>
          </div>
        ) : error && disasters.length === 0 ? (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive space-y-1.5">
            <p className="font-semibold">Unable to load hazard feeds</p>
            <p className="text-[11px] opacity-90">{error}</p>
          </div>
        ) : (
          <>
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-muted/40 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Active Hazards
                </span>
                <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">
                  {disasters.length}
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Official Alerts
                </span>
                <span className="text-lg font-bold font-mono text-destructive mt-0.5 block">
                  {officialCount}
                </span>
              </div>

              <div className="rounded-lg bg-muted/40 p-2 border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Critical / High
                </span>
                <span className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400 mt-0.5 block">
                  {criticalCount}
                </span>
              </div>
            </div>

            {/* Highest Priority / Most Severe Event */}
            {mostSevereDisaster ? (
              <div className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {mostSevereDisaster.isOfficialAlert ? (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 flex items-center gap-1 font-bold">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        OFFICIAL WARNING
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {mostSevereDisaster.categoryTitle}
                      </Badge>
                    )}
                  </div>
                  <SeverityBadge level={mostSevereDisaster.severity} size="sm" />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-foreground leading-snug line-clamp-2">
                    {mostSevereDisaster.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                    {mostSevereDisaster.description || `Monitored by ${mostSevereDisaster.sourceName}.`}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    {mostSevereDisaster.distanceKm !== undefined
                      ? `${mostSevereDisaster.distanceKm.toLocaleString()} km away`
                      : mostSevereDisaster.region}
                  </span>
                  <span>{mostSevereDisaster.sourceName}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                <ShieldAlert className="h-4 w-4 mx-auto mb-1 text-muted-foreground/60" />
                No critical or high hazards detected in current scope.
              </div>
            )}

            {/* Action Link to Interactive GIS Map */}
            <Button asChild size="sm" variant="outline" className="w-full text-xs gap-1.5">
              <Link href="/map">
                <Map className="h-3.5 w-3.5 text-primary" />
                Open Interactive Multi-Hazard Map
                <ArrowRight className="h-3 w-3 ml-auto" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
