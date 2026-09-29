"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NormalizedWeather } from "../types/weather";
import { getWmoWeatherInterpretation } from "../constants/wmo-codes";

export interface WeatherCompactBadgeProps {
  weather?: NormalizedWeather | null;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

export function WeatherCompactBadge({
  weather,
  isLoading,
  className,
  onClick,
}: WeatherCompactBadgeProps) {
  if (isLoading && !weather) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-background/90 backdrop-blur-md border-border/80 text-muted-foreground animate-pulse text-xs py-1 px-2.5",
          className
        )}
      >
        Loading weather...
      </Badge>
    );
  }

  if (!weather) {
    return null;
  }

  const { icon: WeatherIcon, label } = getWmoWeatherInterpretation(weather.weatherCode);

  return (
    <Badge
      variant="outline"
      onClick={onClick}
      className={cn(
        "bg-background/90 backdrop-blur-md border-border/80 shadow-sm text-foreground flex items-center gap-1.5 py-1 px-2.5 transition-colors cursor-default",
        onClick && "cursor-pointer hover:bg-muted/80",
        className
      )}
      title={`${weather.locationName}: ${label}, ${Math.round(weather.temperature)}°C (Humidity: ${weather.humidity}%, Wind: ${Math.round(weather.windSpeed)} km/h)`}
    >
      <WeatherIcon className="h-3.5 w-3.5 text-primary" />
      <span className="font-semibold font-mono">{Math.round(weather.temperature)}°C</span>
      <span className="text-muted-foreground text-[11px] hidden sm:inline">&bull; {label}</span>
      {weather.isStale && (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Stale cache" />
      )}
    </Badge>
  );
}
