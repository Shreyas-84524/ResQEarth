import * as React from "react";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  X,
  ChevronRight,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { AlertSourceType, RiskLevel } from "@/types";

export interface WarningBannerData {
  id: string;
  title: string;
  message: string;
  precautions?: string;
  disasterType: string;
  severity: RiskLevel | "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL";
  sourceType: AlertSourceType | "official" | "automatic" | "manual-admin";
  sourceName?: string;
  region?: string;
  guideSlug?: string;
}

export interface NotificationBannerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data: WarningBannerData;
  onDismiss?: (id: string) => void;
  onOpenGuide?: (slug: string) => void;
}

function getBannerStyle(severity: string): {
  containerClass: string;
  iconClass: string;
  icon: LucideIcon;
} {
  const norm = severity.toUpperCase();
  if (norm === "CRITICAL") {
    return {
      containerClass:
        "bg-red-600 text-white border-red-700 shadow-md animate-pulse",
      iconClass: "text-white",
      icon: Flame,
    };
  }
  if (norm === "HIGH") {
    return {
      containerClass: "bg-orange-600 text-white border-orange-700 shadow-md",
      iconClass: "text-white",
      icon: AlertTriangle,
    };
  }
  if (norm === "MODERATE") {
    return {
      containerClass:
        "bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-medium",
      iconClass: "text-slate-950",
      icon: AlertTriangle,
    };
  }
  return {
    containerClass: "bg-sky-600 text-white border-sky-700 shadow-sm",
    iconClass: "text-white",
    icon: ShieldAlert,
  };
}

export function NotificationBanner({
  data,
  onDismiss,
  onOpenGuide,
  className,
  ...props
}: NotificationBannerProps) {
  const { containerClass, iconClass, icon: Icon } = getBannerStyle(
    data.severity
  );

  return (
    <div
      role="alert"
      className={cn(
        "relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4 transition-all",
        containerClass,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-black/10 p-1.5 shrink-0 mt-0.5">
          <Icon className={cn("h-5 w-5", iconClass)} aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold uppercase tracking-wider text-xs bg-black/20 px-2 py-0.5 rounded">
              {data.severity} WARNING
            </span>
            {data.sourceType === "official" ? (
              <Badge variant="official" className="bg-white/20 text-white border-transparent">
                OFFICIAL ALERT
              </Badge>
            ) : data.sourceType === "manual-admin" ? (
              <Badge variant="simulation" className="bg-white/20 text-white border-transparent">
                SIMULATION / DEMO
              </Badge>
            ) : (
              <Badge variant="calculated" className="bg-white/20 text-white border-transparent">
                CALCULATED RISK
              </Badge>
            )}
            {data.region && (
              <span className="text-xs inline-flex items-center gap-1 opacity-90">
                <MapPin className="h-3 w-3" />
                {data.region}
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-bold leading-tight">
            {data.title}
          </h4>

          <p className="text-xs opacity-90 line-clamp-2 max-w-3xl">
            {data.message}
          </p>

          {data.precautions && (
            <p className="text-[11px] opacity-95 bg-black/10 px-2 py-1 rounded inline-block">
              <span className="font-bold">Precautions: </span>
              {data.precautions}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
        {data.guideSlug && onOpenGuide && (
          <button
            type="button"
            onClick={() => onOpenGuide(data.guideSlug!)}
            className="inline-flex items-center gap-1 rounded bg-black/20 hover:bg-black/30 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors"
          >
            Safety Guide
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(data.id)}
            className="rounded p-1 hover:bg-black/20 transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
