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
        "bg-red-50 text-red-950 border-red-200",
      iconClass: "text-red-700",
      icon: Flame,
    };
  }
  if (norm === "HIGH") {
    return {
      containerClass: "bg-amber-50 text-amber-950 border-amber-200",
      iconClass: "text-amber-700",
      icon: AlertTriangle,
    };
  }
  if (norm === "MODERATE") {
    return {
      containerClass:
        "bg-amber-50 text-amber-950 border-amber-200",
      iconClass: "text-amber-700",
      icon: AlertTriangle,
    };
  }
  return {
    containerClass: "bg-sky-50 text-sky-950 border-sky-200",
    iconClass: "text-sky-700",
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
        "relative flex flex-col gap-4 rounded-xl border p-5 transition-all sm:flex-row sm:items-center sm:justify-between",
        containerClass,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white/70 p-2 shrink-0 mt-0.5 shadow-sm ring-1 ring-black/5">
          <Icon className={cn("h-5 w-5", iconClass)} aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold uppercase tracking-[0.14em] text-[10px]">
              {data.severity} WARNING
            </span>
            {data.sourceType === "official" ? (
              <Badge variant="official">
                OFFICIAL ALERT
              </Badge>
            ) : data.sourceType === "manual-admin" ? (
              <Badge variant="simulation">
                SIMULATION / DEMO
              </Badge>
            ) : (
              <Badge variant="calculated">
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

          <h4 className="text-sm sm:text-base font-semibold leading-tight">
            {data.title}
          </h4>

          <p className="text-xs opacity-75 line-clamp-2 max-w-3xl leading-5">
            {data.message}
          </p>

          {data.precautions && (
            <p className="text-[11px] opacity-80">
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
            className="rounded-md p-1.5 hover:bg-black/5 transition-colors"
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
