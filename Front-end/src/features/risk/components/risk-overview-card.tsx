"use client";

import * as React from "react";
import {
  ShieldCheck,
  Info,
  AlertCircle,
  AlertTriangle,
  Flame,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RiskAssessment } from "../types";

export interface RiskOverviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  assessment: RiskAssessment;
  isLoading?: boolean;
  onRefresh?: () => void;
  showBreakdown?: boolean;
}

function getRiskBandColor(score: number): {
  color: string;
  bg: string;
  badgeVariant: "risk-low" | "risk-guarded" | "risk-moderate" | "risk-high" | "risk-critical";
  icon: React.ComponentType<{ className?: string }>;
} {
  if (score <= 20)
    return {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500",
      badgeVariant: "risk-low",
      icon: ShieldCheck,
    };
  if (score <= 40)
    return {
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500",
      badgeVariant: "risk-guarded",
      icon: Info,
    };
  if (score <= 60)
    return {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
      badgeVariant: "risk-moderate",
      icon: AlertCircle,
    };
  if (score <= 80)
    return {
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500",
      badgeVariant: "risk-high",
      icon: AlertTriangle,
    };
  return {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-600",
    badgeVariant: "risk-critical",
    icon: Flame,
  };
}

export function RiskOverviewCard({
  assessment,
  isLoading = false,
  onRefresh,
  showBreakdown = true,
  className,
  ...props
}: RiskOverviewCardProps) {
  const { score, level, disasterType, regionName, calculatedAt, modelVersion, contributions, missingInputs, confidence, activeOfficialAlertsCount } = assessment;

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const { color, bg, badgeVariant, icon: Icon } = getRiskBandColor(clampedScore);

  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-sm", className)} {...props}>
      {/* 1. Header with STRICT PROVENANCE BADGE */}
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="calculated" className="font-bold tracking-wide">
              RESQEARTH CALCULATED RISK
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground">
              {modelVersion}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold uppercase",
                confidence === "HIGH"
                  ? "text-emerald-600 border-emerald-500/30"
                  : confidence === "MODERATE"
                  ? "text-amber-600 border-amber-500/30"
                  : "text-red-600 border-red-500/30"
              )}
            >
              {confidence} Confidence
            </Badge>

            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh risk calculation"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-primary")} />
              </Button>
            )}
          </div>
        </div>

        <div className="pt-1">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>{disasterType || "Multi-Hazard Assessment"}</span>
            <span className="text-xs font-normal text-muted-foreground font-mono">
              {new Date(calculatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </CardTitle>
          <CardDescription className="text-xs truncate">
            Subject Region: <strong className="text-foreground">{regionName}</strong>
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 2. Score Gauge & Summary */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-full bg-muted/60 shrink-0", color)}>
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-3xl sm:text-4xl font-extrabold font-mono tracking-tight", color)}>
                  {clampedScore}
                </span>
                <span className="text-sm font-semibold text-muted-foreground font-mono">
                  / 100
                </span>
              </div>
              <Badge variant={badgeVariant} className="mt-0.5 uppercase tracking-wider text-[10px] font-bold">
                {level} RISK
              </Badge>
            </div>
          </div>

          <div className="text-right text-xs text-muted-foreground max-w-[180px] space-y-1">
            <p className="leading-tight text-[11px]">
              {assessment.summaryExplanation}
            </p>
            {activeOfficialAlertsCount > 0 && (
              <div className="flex items-center justify-end gap-1 text-[10px] text-destructive font-semibold">
                <ShieldAlert className="h-3 w-3 shrink-0" />
                <span>{activeOfficialAlertsCount} Statutory Alert Active</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Visual Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", bg)}
              style={{ width: `${clampedScore}%` }}
              role="progressbar"
              aria-valuenow={clampedScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Calculated risk score ${clampedScore} out of 100`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-0.5">
            <span>0 Low</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100 Critical</span>
          </div>
        </div>

        {/* 4. Itemized Contributing Factors with Transparent Points */}
        {showBreakdown && contributions.length > 0 ? (
          <div className="space-y-2 border-t border-border/50 pt-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                Contributing Factors Breakdown
              </span>
              <span>Weight Added</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "flex items-start justify-between gap-2 text-xs rounded-lg p-2 transition-colors",
                    c.isOfficialStatutory
                      ? "bg-amber-500/10 border border-amber-500/20"
                      : "bg-muted/40 border border-border/40"
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span>{c.name}</span>
                      {c.isOfficialStatutory && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-600 border-amber-500/40">
                          Statutory
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {c.description}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-primary shrink-0 text-sm">
                    +{c.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2 bg-muted/20 rounded-lg">
            No anomalous hazard factors observed. Nominal environmental baseline.
          </div>
        )}

        {/* 5. Missing / Stale Inputs Disclosure */}
        {missingInputs && missingInputs.length > 0 && (
          <div className="rounded-lg bg-muted/40 border border-border/60 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">Unmonitored / Stale Feeds: </span>
              <span>{missingInputs.join("; ")}. Safe historical baseline assumed.</span>
            </div>
          </div>
        )}

        {/* 6. Statutory Disclaimer (Non-Evacuation & Educational) */}
        <div className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/40 pt-2.5 space-y-1">
          <p className="italic">
            <strong>Important Notice:</strong> ResQEarth Calculated Risk is an educational decision-support model combining Open-Meteo, USGS, and NASA telemetry. It does <strong>not</strong> replace official meteorological forecasts or administrative evacuation orders issued by the National Disaster Management Authority (NDMA) or IMD.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
