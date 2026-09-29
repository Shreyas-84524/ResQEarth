"use client";

import * as React from "react";
import { ShieldCheck, Info, AlertCircle, AlertTriangle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { RiskLevel } from "@/types";

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  level: RiskLevel;
  showScore?: boolean;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
}

function getRiskColorConfig(level: RiskLevel) {
  switch (level) {
    case "LOW":
      return {
        variant: "risk-low" as const,
        icon: ShieldCheck,
      };
    case "GUARDED":
      return {
        variant: "risk-guarded" as const,
        icon: Info,
      };
    case "MODERATE":
      return {
        variant: "risk-moderate" as const,
        icon: AlertCircle,
      };
    case "HIGH":
      return {
        variant: "risk-high" as const,
        icon: AlertTriangle,
      };
    case "CRITICAL":
      return {
        variant: "risk-critical" as const,
        icon: Flame,
      };
    default:
      return {
        variant: "risk-low" as const,
        icon: ShieldCheck,
      };
  }
}

export function RiskBadge({
  score,
  level,
  showScore = true,
  showIcon = true,
  size = "default",
  className,
  ...props
}: RiskBadgeProps) {
  const { variant, icon: Icon } = getRiskColorConfig(level);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      <Badge
        variant={variant}
        className={cn(
          "font-mono font-bold tracking-wide uppercase flex items-center gap-1 shadow-none",
          size === "sm" && "text-[10px] px-1.5 py-0",
          size === "default" && "text-xs px-2 py-0.5",
          size === "lg" && "text-sm px-2.5 py-1"
        )}
      >
        {showIcon && <Icon className={cn("h-3 w-3 shrink-0", size === "lg" && "h-4 w-4")} />}
        <span>{level}</span>
        {showScore && <span className="opacity-90">({clampedScore})</span>}
      </Badge>
    </div>
  );
}
