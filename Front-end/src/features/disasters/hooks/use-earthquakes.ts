"use client";

import * as React from "react";
import type {
  NormalizedEarthquake,
  EarthquakeFeedTimeWindow,
} from "../types/earthquake";
import {
  fetchEarthquakes,
  earthquakesToGeoJson,
} from "../services/earthquake-service";
import { useGeolocation } from "@/features/map/hooks/use-geolocation";

export interface UseEarthquakesOptions {
  initialFeedType?: EarthquakeFeedTimeWindow;
  minMagnitude?: number;
  maxDistanceKm?: number;
  autoFetch?: boolean;
}

export function useEarthquakes(options?: UseEarthquakesOptions) {
  const { location } = useGeolocation();

  const [feedType, setFeedType] = React.useState<EarthquakeFeedTimeWindow>(
    options?.initialFeedType || "day_2.5"
  );
  const [minMagnitude, setMinMagnitude] = React.useState<number>(
    options?.minMagnitude ?? 0
  );
  const [maxDistanceKm, setMaxDistanceKm] = React.useState<number | undefined>(
    options?.maxDistanceKm
  );
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const [rawEarthquakes, setRawEarthquakes] = React.useState<NormalizedEarthquake[]>([]);
  const [selectedEarthquake, setSelectedEarthquake] =
    React.useState<NormalizedEarthquake | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isStale, setIsStale] = React.useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<string | null>(null);

  const autoFetch = options?.autoFetch ?? true;

  const loadEarthquakes = React.useCallback(
    async (forceRefresh = false, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchEarthquakes(feedType, {
          userLat: location.latitude,
          userLon: location.longitude,
          forceRefresh,
          signal,
        });

        if (!signal?.aborted) {
          setRawEarthquakes(data);
          setIsStale(data.some((d) => d.isStale));
          setLastFetchedAt(new Date().toISOString());
        }
      } catch (err: unknown) {
        if (!signal?.aborted) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load seismic monitoring feed.";
          setError(message);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [feedType, location.latitude, location.longitude]
  );

  // Trigger fetch on mount or feedType change
  React.useEffect(() => {
    if (!autoFetch) return;

    const controller = new AbortController();
    loadEarthquakes(false, controller.signal);

    return () => {
      controller.abort();
    };
  }, [autoFetch, loadEarthquakes]);

  // Client-side filtering
  const filteredEarthquakes = React.useMemo(() => {
    return rawEarthquakes.filter((eq) => {
      if (minMagnitude > 0 && eq.magnitude < minMagnitude) {
        return false;
      }
      if (
        maxDistanceKm !== undefined &&
        eq.distanceKm !== undefined &&
        eq.distanceKm > maxDistanceKm
      ) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesPlace = eq.place.toLowerCase().includes(query);
        const matchesTitle = eq.title.toLowerCase().includes(query);
        if (!matchesPlace && !matchesTitle) {
          return false;
        }
      }
      return true;
    });
  }, [rawEarthquakes, minMagnitude, maxDistanceKm, searchQuery]);

  // GeoJSON representation for MapLibre
  const geoJson = React.useMemo(() => {
    return earthquakesToGeoJson(filteredEarthquakes);
  }, [filteredEarthquakes]);

  // Sorted nearby earthquakes (closest first)
  const nearbyEarthquakes = React.useMemo(() => {
    return [...filteredEarthquakes]
      .filter((eq) => typeof eq.distanceKm === "number")
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [filteredEarthquakes]);

  // Strongest event in the feed
  const strongestRecent = React.useMemo(() => {
    if (filteredEarthquakes.length === 0) return null;
    return [...filteredEarthquakes].sort((a, b) => b.magnitude - a.magnitude)[0];
  }, [filteredEarthquakes]);

  const refresh = React.useCallback(async () => {
    await loadEarthquakes(true);
  }, [loadEarthquakes]);

  return {
    earthquakes: filteredEarthquakes,
    rawCount: rawEarthquakes.length,
    geoJson,
    nearbyEarthquakes,
    strongestRecent,
    selectedEarthquake,
    setSelectedEarthquake,
    feedType,
    setFeedType,
    minMagnitude,
    setMinMagnitude,
    maxDistanceKm,
    setMaxDistanceKm,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    isStale,
    lastFetchedAt,
    refresh,
  };
}
