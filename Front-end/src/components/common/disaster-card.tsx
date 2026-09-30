import * as React from "react";
import {
  Waves,
  Wind,
  Activity,
  Mountain,
  SunMedium,
  Biohazard,
  Flame,
  AlertOctagon,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { AlertSourceType, RiskLevel } from "@/types";

export interface DisasterCardData {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: RiskLevel | "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL";
  sourceType: AlertSourceType | "official" | "automatic" | "manual-admin";
  sourceName?: string;
  sourceUrl?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  occurredAt: string;
  slug?: string;
}

export interface DisasterCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: DisasterCardData;
  onSelect?: (id: string) => void;
  onOpenGuide?: (slug: string) => void;
}

function getDisasterIcon(type: string): LucideIcon {
  const norm = type.toLowerCase().replace(/[\s-_]/g, "");
  if (norm.includes("flood")) return Waves;
  if (norm.includes("cyclone") || norm.includes("storm") || norm.includes("hurricane")) return Wind;
  if (norm.includes("earthquake") || norm.includes("quake") || norm.includes("tsunami")) return Activity;
  if (norm.includes("landslide") || norm.includes("avalanche")) return Mountain;
  if (norm.includes("heat") || norm.includes("drought")) return SunMedium;
  if (norm.includes("chemical") || norm.includes("bio") || norm.includes("nuclear") || norm.includes("hazard")) return Biohazard;
  if (norm.includes("fire") || norm.includes("wildfire")) return Flame;
  return AlertOctagon;
}

function getProvenanceBadge(sourceType: AlertSourceType | string, sourceName?: string) {
  if (sourceType === "official") {
    return (
      <Badge variant="official" title={`Official alert issued by ${sourceName || "authorized agency"}`}>
        OFFICIAL ALERT
      </Badge>
    );
  }
  if (sourceType === "manual-admin") {
    return (
      <Badge variant="simulation" title="Administrative warning / college demonstration">
        SIMULATION
      </Badge>
    );
  }
  return (
    <Badge variant="calculated" title="Calculated by ResQEarth Risk Engine">
      CALCULATED
    </Badge>
  );
}

export function DisasterCard({
  data,
  onSelect,
  onOpenGuide,
  className,
  ...props
}: DisasterCardProps) {
  const Icon = getDisasterIcon(data.type);

  return (
    <Card
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-[14px] border border-[#EEF1EE] bg-white text-[#0A0A0A] shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-all duration-[180ms] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8FAD9] text-[#0B8F2F]">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#137D43]">
                {data.type}
              </span>
              <CardTitle className="text-base font-bold text-[#0A0A0A] line-clamp-1">
                {data.title}
              </CardTitle>
            </div>
          </div>
          <SeverityBadge level={data.severity} size="sm" />
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          {getProvenanceBadge(data.sourceType, data.sourceName)}
          {data.sourceName && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
              {data.sourceName}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3 text-xs">
        <p className="text-muted-foreground line-clamp-2 mb-3">
          {data.description}
        </p>

        <div className="space-y-1.5 text-muted-foreground border-t border-border/50 pt-2 text-[11px]">
          {data.locationName && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">{data.locationName}</span>
              {data.distanceKm !== undefined && (
                <span className="font-mono font-medium text-foreground ml-auto shrink-0">
                  {Math.round(data.distanceKm)} km away
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {new Date(data.occurredAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between border-t border-border/40 py-2.5 bg-muted/20 text-xs">
        {data.sourceUrl ? (
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Source Link
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {data.slug && onOpenGuide && (
            <button
              type="button"
              onClick={() => onOpenGuide(data.slug!)}
              className="font-medium text-primary hover:underline inline-flex items-center gap-0.5 text-xs"
            >
              Safety Guide
              <ChevronRight className="h-3 w-3" />
            </button>
          )}

          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(data.id)}
              className="rounded bg-primary/10 px-2 py-1 font-medium text-primary hover:bg-primary/20 transition-colors text-xs"
            >
              View on Map
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
