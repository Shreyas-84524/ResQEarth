"use client";

import * as React from "react";
import {
  Waves,
  Wind,
  Activity,
  SunMedium,
  Flame,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DisasterCategoryRisk, HazardCategoryKey } from "../types";

export interface PerHazardRiskGridProps extends React.HTMLAttributes<HTMLDivElement> {
  hazardBreakdown: DisasterCategoryRisk[];
}

function getHazardIcon(category: HazardCategoryKey) {
  switch (category) {
    case "flood":
      return Waves;
    case "storm":
      return Wind;
    case "earthquake":
      return Activity;
    case "heatwave":
      return SunMedium;
    case "wildfire":
      return Flame;
    default:
      return ShieldCheck;
  }
}

function getHazardSlug(category: HazardCategoryKey): string {
  switch (category) {
    case "flood":
      return "flood";
    case "storm":
      return "cyclone";
    case "earthquake":
      return "earthquake";
    case "heatwave":
      return "heat-wave";
    case "wildfire":
      return "wildfire";
    default:
      return "flood";
  }
}

function getBadgeVariant(level: string): "risk-low" | "risk-guarded" | "risk-moderate" | "risk-high" | "risk-critical" {
  switch (level) {
    case "LOW":
      return "risk-low";
    case "GUARDED":
      return "risk-guarded";
    case "MODERATE":
      return "risk-moderate";
    case "HIGH":
      return "risk-high";
    case "CRITICAL":
      return "risk-critical";
    default:
      return "risk-low";
  }
}

function getProgressColor(score: number): string {
  if (score <= 20) return "bg-emerald-500";
  if (score <= 40) return "bg-sky-500";
  if (score <= 60) return "bg-amber-500";
  if (score <= 80) return "bg-orange-500";
  return "bg-red-600";
}

export function PerHazardRiskGrid({
  hazardBreakdown,
  className,
  ...props
}: PerHazardRiskGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5", className)} {...props}>
      {hazardBreakdown.map((hazard) => {
        const Icon = getHazardIcon(hazard.category);
        const slug = getHazardSlug(hazard.category);
        const progressBg = getProgressColor(hazard.score);

        return (
          <Card
            key={hazard.category}
            className="border-border/80 transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between"
          >
            <CardContent className="p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {hazard.title}
                  </span>
                </div>
                <Badge variant={getBadgeVariant(hazard.level)} className="text-[9px] uppercase px-1.5 py-0 font-mono">
                  {hazard.level}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-foreground">
                    {hazard.score}
                    <span className="text-[10px] text-muted-foreground font-normal"> / 100</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                    {hazard.dominantFactor}
                  </span>
                </div>

                <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", progressBg)}
                    style={{ width: `${Math.max(4, hazard.score)}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 border-t border-border/40">
                <Link
                  href={`/disasters/${slug}`}
                  className="text-[11px] text-primary hover:underline flex items-center justify-between group"
                >
                  <span>Preparedness Guide</span>
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
