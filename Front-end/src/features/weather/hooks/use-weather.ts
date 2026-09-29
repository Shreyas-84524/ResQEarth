"use client";

import * as React from "react";
import type { NormalizedWeather } from "../types/weather";
import { fetchWeather, generateWeatherCacheKey } from "../services/weather-service";
import { useGeolocation } from "@/features/map/hooks/use-geolocation";

export interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  autoFetch?: boolean;
}

export interface UseWeatherReturn {
  weather: NormalizedWeather | null;
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  lastFetchedAt: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(options?: UseWeatherOptions): UseWeatherReturn {
  const { location: geoLoc } = useGeolocation();

  // Prefer explicit coordinates if provided, else use current geo-location
  const targetLat = options?.latitude ?? geoLoc.latitude;
  const targetLon = options?.longitude ?? geoLoc.longitude;
  const targetName =
    options?.locationName ??
    (geoLoc.city
      ? `${geoLoc.city}, ${geoLoc.state}`
      : geoLoc.formattedAddress || "Current Area");
  const autoFetch = options?.autoFetch ?? true;

  const [weather, setWeather] = React.useState<NormalizedWeather | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isStale, setIsStale] = React.useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<string | null>(null);

  const prevCacheKeyRef = React.useRef<string>("");

  const loadWeather = React.useCallback(
    async (forceRefresh = false, signal?: AbortSignal) => {
      if (typeof targetLat !== "number" || typeof targetLon !== "number") {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchWeather(targetLat, targetLon, {
          locationName: targetName,
          forceRefresh,
          signal,
        });

        if (!signal?.aborted) {
          setWeather(result);
          setIsStale(result.isStale);
          setLastFetchedAt(new Date().toISOString());
        }
      } catch (err: unknown) {
        if (!signal?.aborted) {
          const message =
            err instanceof Error ? err.message : "Failed to load weather conditions";
          setError(message);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [targetLat, targetLon, targetName]
  );

  // Trigger fetch when location coordinates change
  React.useEffect(() => {
    if (!autoFetch) return;

    const currentKey = generateWeatherCacheKey(targetLat, targetLon);
    // Even if key is same, we might need initial load
    const abortController = new AbortController();

    if (currentKey !== prevCacheKeyRef.current || !weather) {
      prevCacheKeyRef.current = currentKey;
      loadWeather(false, abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [targetLat, targetLon, autoFetch, loadWeather, weather]);

  const refresh = React.useCallback(async () => {
    await loadWeather(true);
  }, [loadWeather]);

  return {
    weather,
    isLoading,
    error,
    isStale,
    lastFetchedAt,
    refresh,
  };
}
