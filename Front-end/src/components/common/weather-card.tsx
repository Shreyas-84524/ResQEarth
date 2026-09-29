import * as React from "react";
import {
  CloudRain,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  CloudSun,
  CloudLightning,
  CloudSnow,
  CloudFog,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export interface WeatherData {
  temperature: number;
  apparentTemperature?: number;
  humidity?: number;
  precipitation?: number;
  precipitationProbability?: number;
  windSpeed?: number;
  windGusts?: number;
  weatherCode?: number;
  locationName?: string;
  updatedAt?: string;
  source?: string;
  isStale?: boolean;
}

export interface WeatherCardProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: WeatherData;
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

function getWeatherIconAndLabel(code?: number): {
  icon: LucideIcon;
  label: string;
} {
  if (code === undefined) return { icon: Sun, label: "Clear" };
  if (code === 0) return { icon: Sun, label: "Clear Sky" };
  if (code >= 1 && code <= 3) return { icon: CloudSun, label: "Partly Cloudy" };
  if (code >= 45 && code <= 48) return { icon: CloudFog, label: "Foggy" };
  if (code >= 51 && code <= 67) return { icon: CloudRain, label: "Rain" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, label: "Snow" };
  if (code >= 80 && code <= 82) return { icon: CloudRain, label: "Rain Showers" };
  if (code >= 95) return { icon: CloudLightning, label: "Thunderstorm" };
  return { icon: CloudSun, label: "Variable" };
}

export function WeatherCard({
  data,
  isLoading = false,
  error,
  onRefresh,
  className,
  ...props
}: WeatherCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("border-destructive/30 bg-destructive/5", className)} {...props}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive flex items-center justify-between">
            <span>Weather Unavailable</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                aria-label="Retry loading weather"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {error || "Unable to fetch local weather conditions at this time."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { icon: WeatherIcon, label: conditionLabel } = getWeatherIconAndLabel(
    data.weatherCode
  );

  return (
    <Card className={cn("overflow-hidden border-border/80", className)} {...props}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">
            {data.locationName || "Current Weather"}
          </CardTitle>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-muted-foreground">
              Source: {data.source || "Open-Meteo"}
            </span>
            {data.isStale && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-400">
                Stale
              </Badge>
            )}
          </div>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Refresh weather"
            aria-label="Refresh weather"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Temperature & Condition */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {Math.round(data.temperature)}
              </span>
              <span className="text-xl font-semibold text-muted-foreground ml-0.5">
                °C
              </span>
            </div>
            {data.apparentTemperature !== undefined && (
              <p className="text-xs text-muted-foreground">
                Feels like {Math.round(data.apparentTemperature)}°C
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <WeatherIcon className="h-10 w-10 text-primary" aria-hidden="true" />
            <span className="text-xs font-medium text-muted-foreground mt-1">
              {conditionLabel}
            </span>
          </div>
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
          {data.humidity !== undefined && (
            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
              <Droplets className="h-4 w-4 text-sky-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground text-[10px]">Humidity</p>
                <p className="font-semibold font-mono">{data.humidity}%</p>
              </div>
            </div>
          )}

          {data.windSpeed !== undefined && (
            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
              <Wind className="h-4 w-4 text-teal-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground text-[10px]">Wind</p>
                <p className="font-semibold font-mono">
                  {data.windSpeed} km/h
                  {data.windGusts ? ` (${data.windGusts}g)` : ""}
                </p>
              </div>
            </div>
          )}

          {data.precipitation !== undefined && (
            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
              <CloudRain className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-muted-foreground text-[10px]">Precipitation</p>
                <p className="font-semibold font-mono">{data.precipitation} mm</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
            <Thermometer className="h-4 w-4 text-orange-500 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-muted-foreground text-[10px]">Updated</p>
              <p className="font-medium text-[11px] truncate">
                {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
