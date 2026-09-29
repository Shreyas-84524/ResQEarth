"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe2,
  MapPin,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { NormalizedGlobalDisaster } from "../types/global-disaster";

export interface GlobalDisasterOverviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  disasters: NormalizedGlobalDisaster[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  mostSevereDisaster?: NormalizedGlobalDisaster | null;
  nearestDisaster?: NormalizedGlobalDisaster | null;
}

export function GlobalDisasterOverviewCard({
  disasters,
  isLoading = false,
  error,
  onRefresh,
  mostSevereDisaster,
  nearestDisaster,
  className,
  ...props
}: GlobalDisasterOverviewCardProps) {
  if (isLoading && disasters.length === 0) {
    return (
      <Card className={cn("border-border/80 overflow-hidden", className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const primaryEvent = mostSevereDisaster || disasters[0];

  return (
    <Card className={cn("border-border/80 overflow-hidden flex flex-col justify-between", className)} {...props}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Globe2 className="h-4 w-4" />
            </div>
            <span>Global Disaster Intelligence</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">
              Source: NASA EONET v3
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
              {disasters.length} Active Events
            </Badge>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh global disaster feed"
            aria-label="Refresh global disasters"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-2 text-xs">
        {error && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-[11px]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{error}</span>
          </div>
        )}

        {primaryEvent ? (
          <div className="rounded-lg bg-muted/30 p-3 border border-border/40 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Highest Severity Monitored Event
                </span>
                <h4 className="text-xs font-bold text-foreground line-clamp-1 mt-0.5">
                  {primaryEvent.title}
                </h4>
              </div>
              <SeverityBadge level={primaryEvent.severity} size="sm" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-[10px] text-muted-foreground">Category</span>
                <p className="font-semibold text-foreground truncate">
                  {primaryEvent.categoryTitle}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Source</span>
                <p className="font-medium text-foreground truncate">
                  {primaryEvent.primarySource.name}
                </p>
              </div>
              {primaryEvent.distanceKm !== undefined && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-muted-foreground">Proximity</span>
                  <p className="font-mono font-bold text-foreground">
                    {primaryEvent.distanceKm.toLocaleString()} km
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-xs">
            No active global disaster events recorded in the current filter.
          </div>
        )}

        {/* Nearest Event mention if distinct */}
        {nearestDisaster && primaryEvent && nearestDisaster.id !== primaryEvent.id && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/20 px-2.5 py-1.5 rounded-md">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">
                Closest: <strong>{nearestDisaster.title}</strong>
              </span>
            </div>
            <span className="font-mono font-medium text-foreground ml-2 shrink-0">
              {nearestDisaster.distanceKm?.toLocaleString()} km
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/40 py-2.5 bg-muted/10 text-xs flex items-center justify-between">
        <a
          href="https://eonet.gsfc.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <span>NASA EONET v3</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>

        <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary hover:text-primary">
          <Link href="/map">
            Explore on Map
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
