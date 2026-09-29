import * as React from "react";
import {
  ShieldCheck,
  Info,
  AlertCircle,
  AlertTriangle,
  Flame,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";

export interface RiskContribution {
  name: string;
  points: number;
  description?: string;
}

export interface RiskAssessmentData {
  score: number;
  level: RiskLevel;
  disasterType?: string;
  regionName?: string;
  calculatedAt: string;
  modelVersion: string;
  contributions: RiskContribution[];
  missingInputs?: string[];
  limitations?: string;
}

export interface RiskIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data: RiskAssessmentData;
  showBreakdown?: boolean;
}

function getRiskBandColor(score: number): {
  color: string;
  bg: string;
  badge: "risk-low" | "risk-guarded" | "risk-moderate" | "risk-high" | "risk-critical";
  icon: React.ComponentType<{ className?: string }>;
} {
  if (score <= 20)
    return {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500",
      badge: "risk-low",
      icon: ShieldCheck,
    };
  if (score <= 40)
    return {
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500",
      badge: "risk-guarded",
      icon: Info,
    };
  if (score <= 60)
    return {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
      badge: "risk-moderate",
      icon: AlertCircle,
    };
  if (score <= 80)
    return {
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500",
      badge: "risk-high",
      icon: AlertTriangle,
    };
  return {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-600",
    badge: "risk-critical",
    icon: Flame,
  };
}

export function RiskIndicator({
  data,
  showBreakdown = true,
  className,
  ...props
}: RiskIndicatorProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(data.score)));
  const { color, bg, badge, icon: Icon } = getRiskBandColor(clampedScore);

  return (
    <Card className={cn("overflow-hidden border-border/80", className)} {...props}>
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="calculated">RESQEARTH CALCULATED RISK</Badge>
            <span className="text-[11px] font-mono text-muted-foreground">
              {data.modelVersion}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {new Date(data.calculatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <CardTitle className="text-base font-bold pt-1">
          {data.disasterType ? `${data.disasterType} Risk Assessment` : "Local Risk Assessment"}
          {data.regionName && (
            <span className="text-muted-foreground font-normal ml-1">
              — {data.regionName}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Score & Gauge */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-muted/60", color)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-3xl sm:text-4xl font-extrabold font-mono", color)}>
                  {clampedScore}
                </span>
                <span className="text-sm font-semibold text-muted-foreground font-mono">
                  / 100
                </span>
              </div>
              <Badge variant={badge} className="mt-0.5 uppercase tracking-wide text-[10px]">
                {data.level}
              </Badge>
            </div>
          </div>

          <div className="text-right text-xs text-muted-foreground max-w-[140px]">
            <p className="leading-tight">
              Calculated from weather, river flow, and regional event observations.
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", bg)}
            style={{ width: `${clampedScore}%` }}
            role="progressbar"
            aria-valuenow={clampedScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Risk score ${clampedScore} out of 100`}
          />
        </div>

        {/* Contributions breakdown */}
        {showBreakdown && data.contributions && data.contributions.length > 0 && (
          <div className="space-y-2 border-t border-border/50 pt-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Contributing Factors
              </span>
              <span>Weight</span>
            </div>

            <div className="space-y-1.5">
              {data.contributions.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs rounded bg-muted/30 px-2.5 py-1.5"
                >
                  <span className="text-foreground">{c.name}</span>
                  <span className="font-mono font-semibold text-primary">
                    +{c.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing inputs note if any */}
        {data.missingInputs && data.missingInputs.length > 0 && (
          <div className="rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Missing/Stale Inputs: </span>
              {data.missingInputs.join(", ")}. Safe baseline assumed.
            </div>
          </div>
        )}

        {/* Legal / Disclaimer statement */}
        <div className="text-[10px] text-muted-foreground/80 leading-relaxed border-t border-border/40 pt-2 italic">
          Disclaimer: ResQEarth calculated risk is an educational decision-support indicator and does not replace official meteorological or disaster management forecasts.
        </div>
      </CardContent>
    </Card>
  );
}
