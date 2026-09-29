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

export interface SeverityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  level: RiskLevel | "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL" | "low" | "guarded" | "moderate" | "high" | "critical";
  score?: number;
  showIcon?: boolean;
  showScore?: boolean;
  size?: "sm" | "default" | "lg";
}

interface SeverityConfig {
  label: string;
  badgeClass: string;
  icon: LucideIcon;
  description: string;
}

const severityConfigs: Record<string, SeverityConfig> = {
  LOW: {
    label: "LOW",
    badgeClass:
      "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-700",
    icon: ShieldCheck,
    description: "Low hazard level. Standard vigilance recommended.",
  },
  GUARDED: {
    label: "GUARDED",
    badgeClass: "bg-sky-600 text-white border-sky-700 dark:bg-sky-700",
    icon: Info,
    description: "Guarded condition. Elevated awareness advised.",
  },
  MODERATE: {
    label: "MODERATE",
    badgeClass:
      "bg-amber-500 text-slate-950 border-amber-600 dark:bg-amber-600 dark:text-white font-bold",
    icon: AlertCircle,
    description: "Moderate hazard detected. Prepare necessary precautions.",
  },
  HIGH: {
    label: "HIGH",
    badgeClass: "bg-orange-600 text-white border-orange-700 dark:bg-orange-700",
    icon: AlertTriangle,
    description: "High hazard threat. Active safety precautions required.",
  },
  CRITICAL: {
    label: "CRITICAL",
    badgeClass:
      "bg-red-600 text-white border-red-700 dark:bg-red-700 animate-pulse",
    icon: Flame,
    description: "Critical emergency risk. Immediate emergency safety action needed.",
  },
};

export function SeverityBadge({
  level,
  score,
  showIcon = true,
  showScore = false,
  size = "default",
  className,
  ...props
}: SeverityBadgeProps) {
  const normalizedLevel = String(level).toUpperCase();
  const config =
    severityConfigs[normalizedLevel] || severityConfigs.LOW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    default: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-bold",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold shadow-sm tracking-wide",
        config.badgeClass,
        sizeClasses[size],
        className
      )}
      title={`${config.label} Severity: ${config.description}`}
      {...props}
    >
      {showIcon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      <span className="uppercase">{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-90 font-mono">({score})</span>
      )}
      <span className="sr-only">Severity Level: {config.label}</span>
    </span>
  );
}
