"use client";

import * as React from "react";
import {
  Droplets,
  Wind,
  CloudRain,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { NormalizedWeather } from "../types/weather";
import { getWmoWeatherInterpretation } from "../constants/wmo-codes";

export interface WeatherOverviewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: NormalizedWeather | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  showHourlyForecast?: boolean;
}

export function WeatherOverviewCard({
  data,
  isLoading = false,
  error,
  onRefresh,
  showHourlyForecast = true,
  className,
  ...props
}: WeatherOverviewCardProps) {
  // 1. Initial Loading Skeleton (when no cached data exists)
  if (isLoading && !data) {
    return (
      <Card className={cn("overflow-hidden border-border/80", className)} {...props}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          {showHourlyForecast && (
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-28" />
              <div className="flex gap-2 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 2. Error State
  if (error && !data) {
    return (
      <Card className={cn("border-destructive/40 bg-destructive/5", className)} {...props}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>Weather Unavailable</span>
            </div>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
                aria-label="Retry loading weather"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-2">
            Default environmental baseline values remain available for risk estimation.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const interpretation = getWmoWeatherInterpretation(data.weatherCode);
  const WeatherIcon = interpretation.icon;

  // Filter next 8 hourly forecast entries
  const upcomingHours = data.hourlyForecast.slice(0, 8);

  return (
    <Card className={cn("overflow-hidden border-border/80 shadow-sm", className)} {...props}>
      {/* Header with Title, Source attribution, and Refresh */}
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span>{data.locationName}</span>
          </CardTitle>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors"
            >
              <span>Source: {data.source}</span>
              <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-60" />
            </a>
            {data.isStale && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 dark:text-amber-400 border-amber-400/50 bg-amber-50 dark:bg-amber-950/30">
                Stale Cache
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
              Live Feed
            </Badge>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            title="Refresh live weather telemetry"
            aria-label="Refresh weather"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-primary")} />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Temperature & Current Condition Banner */}
        <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border border-border/40">
          <div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                {Math.round(data.temperature)}
              </span>
              <span className="text-xl font-semibold text-muted-foreground ml-0.5">
                °C
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Feels like <span className="font-semibold text-foreground font-mono">{Math.round(data.apparentTemperature)}°C</span>
            </p>
          </div>

          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-2">
              <WeatherIcon className="h-9 w-9 text-primary shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {interpretation.label}
                </p>
                <p className="text-[11px] text-muted-foreground max-w-[150px] sm:max-w-[200px] truncate">
                  {interpretation.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item Weather Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Humidity */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 border border-border/40">
            <div className="h-8 w-8 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">Humidity</p>
              <p className="font-semibold font-mono text-foreground text-sm">{data.humidity}%</p>
            </div>
          </div>

          {/* Wind Speed & Gusts */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 border border-border/40">
            <div className="h-8 w-8 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">Wind / Gusts</p>
              <p className="font-semibold font-mono text-foreground text-sm">
                {Math.round(data.windSpeed)} <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
                {data.windGusts > data.windSpeed && (
                  <span className="text-[10px] text-muted-foreground font-mono ml-1">
                    ({Math.round(data.windGusts)}g)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Precipitation & Probability */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 border border-border/40">
            <div className="h-8 w-8 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CloudRain className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">Precipitation</p>
              <p className="font-semibold font-mono text-foreground text-sm">
                {data.precipitation} <span className="text-[10px] font-normal text-muted-foreground">mm</span>
                {data.precipitationProbability > 0 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono ml-1">
                    ({data.precipitationProbability}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Telemetry Freshness */}
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 p-2.5 border border-border/40">
            <div className="h-8 w-8 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">Updated</p>
              <p className="font-semibold font-mono text-foreground text-xs truncate">
                {data.updatedAt
                  ? new Date(data.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </p>
            </div>
          </div>
        </div>

        {/* 8-Hour Hourly Trend Ribbon */}
        {showHourlyForecast && upcomingHours.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground text-[11px]">8-Hour Forecast Horizon</span>
              <span className="text-[10px] font-mono">Open-Meteo Hourly</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {upcomingHours.map((hour, idx) => {
                const hourInterp = getWmoWeatherInterpretation(hour.weatherCode);
                const HourIcon = hourInterp.icon;
                const timeLabel = hour.time.includes("T")
                  ? hour.time.split("T")[1].slice(0, 5)
                  : hour.time.slice(11, 16);

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center min-w-[62px] py-2 px-1.5 rounded-lg bg-muted/30 border border-border/40 shrink-0 text-center"
                  >
                    <span className="text-[10px] text-muted-foreground font-mono mb-1">
                      {timeLabel}
                    </span>
                    <HourIcon className="h-4 w-4 text-primary my-0.5" />
                    <span className="text-xs font-semibold font-mono text-foreground mt-0.5">
                      {Math.round(hour.temperature)}°
                    </span>
                    {hour.precipitationProbability !== undefined && hour.precipitationProbability > 0 && (
                      <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                        {hour.precipitationProbability}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Educational / Academic Disclaimer */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
          <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
          <span>Non-commercial Open-Meteo API feed &bull; Integrated for environmental awareness & risk estimation.</span>
        </div>
      </CardContent>
    </Card>
  );
}
