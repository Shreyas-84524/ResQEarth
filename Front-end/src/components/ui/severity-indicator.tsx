import * as React from "react";
import {
  ShieldCheck,
  Info,
  AlertCircle,
  AlertTriangle,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

export interface SeverityIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  level: RiskLevel | "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL";
  score?: number;
  label?: string;
  showBar?: boolean;
}

interface LevelDetails {
  title: string;
  rangeText: string;
  colorClass: string;
  barColor: string;
  bgLight: string;
  icon: LucideIcon;
  advice: string;
}

const levelMap: Record<string, LevelDetails> = {
  LOW: {
    title: "Low Risk",
    rangeText: "0–20",
    colorClass: "text-emerald-700 dark:text-emerald-400",
    barColor: "bg-emerald-500",
    bgLight: "bg-emerald-500/10 border-emerald-500/20",
    icon: ShieldCheck,
    advice: "Normal baseline conditions. Follow everyday safety awareness.",
  },
  GUARDED: {
    title: "Guarded Risk",
    rangeText: "21–40",
    colorClass: "text-sky-700 dark:text-sky-400",
    barColor: "bg-sky-500",
    bgLight: "bg-sky-500/10 border-sky-500/20",
    icon: Info,
    advice: "Elevated environmental conditions. Stay informed on regional updates.",
  },
  MODERATE: {
    title: "Moderate Risk",
    rangeText: "41–60",
    colorClass: "text-amber-700 dark:text-amber-400",
    barColor: "bg-amber-500",
    bgLight: "bg-amber-500/10 border-amber-500/20",
    icon: AlertCircle,
    advice: "Hazardous conditions likely. Review precautions and emergency kits.",
  },
  HIGH: {
    title: "High Risk",
    rangeText: "61–80",
    colorClass: "text-orange-700 dark:text-orange-400",
    barColor: "bg-orange-500",
    bgLight: "bg-orange-500/10 border-orange-500/20",
    icon: AlertTriangle,
    advice: "Severe hazard threat. Avoid vulnerable locations and prepare to act.",
  },
  CRITICAL: {
    title: "Critical Risk",
    rangeText: "81–100",
    colorClass: "text-red-700 dark:text-red-400",
    barColor: "bg-red-600",
    bgLight: "bg-red-500/10 border-red-500/30 animate-pulse",
    icon: Flame,
    advice: "Extreme disaster emergency. Follow official instructions immediately.",
  },
};

export function SeverityIndicator({
  level,
  score,
  label = "Severity Assessment",
  showBar = true,
  className,
  ...props
}: SeverityIndicatorProps) {
  const normLevel = String(level).toUpperCase();
  const details = levelMap[normLevel] || levelMap.LOW;
  const Icon = details.icon;
  const clampedScore = score !== undefined ? Math.max(0, Math.min(100, score)) : undefined;

  return (
    <div
      className={cn("rounded-lg border p-4", details.bgLight, className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", details.colorClass)} aria-hidden="true" />
          <div>
            <h4 className={cn("text-sm font-bold uppercase tracking-wider", details.colorClass)}>
              {normLevel} ({details.rangeText})
            </h4>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
        {clampedScore !== undefined && (
          <div className="text-right">
            <span className={cn("text-2xl font-extrabold font-mono", details.colorClass)}>
              {clampedScore}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/100</span>
          </div>
        )}
      </div>

      {showBar && (
        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden mb-2">
          <div
            className={cn("h-full rounded-full transition-all duration-500", details.barColor)}
            style={{ width: `${clampedScore !== undefined ? clampedScore : 50}%` }}
            role="progressbar"
            aria-valuenow={clampedScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${normLevel} severity score`}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">{details.advice}</p>
    </div>
  );
}
