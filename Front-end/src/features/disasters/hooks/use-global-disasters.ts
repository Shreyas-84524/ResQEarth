"use client";

import * as React from "react";
import type {
  NormalizedGlobalDisaster,
  GlobalDisasterCategory,
} from "../types/global-disaster";
import {
  fetchGlobalDisasters,
  globalDisastersToGeoJson,
} from "../services/global-disaster-service";
import { useGeolocation } from "@/features/map/hooks/use-geolocation";

export interface UseGlobalDisastersOptions {
  initialCategory?: GlobalDisasterCategory;
  initialStatus?: "open" | "all";
  initialDays?: number;
  autoFetch?: boolean;
}

export function useGlobalDisasters(options?: UseGlobalDisastersOptions) {
  const { location } = useGeolocation();

  const [categoryFilter, setCategoryFilter] = React.useState<GlobalDisasterCategory>(
    options?.initialCategory || "all"
  );
  const [statusFilter, setStatusFilter] = React.useState<"open" | "all">(
    options?.initialStatus || "open"
  );
  const [days, setDays] = React.useState<number>(options?.initialDays || 30);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const [rawDisasters, setRawDisasters] = React.useState<NormalizedGlobalDisaster[]>([]);
  const [selectedDisaster, setSelectedDisaster] =
    React.useState<NormalizedGlobalDisaster | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isStale, setIsStale] = React.useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = React.useState<string | null>(null);

  const autoFetch = options?.autoFetch ?? true;

  const loadDisasters = React.useCallback(
    async (forceRefresh = false, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchGlobalDisasters({
          status: statusFilter,
          days,
          userLat: location.latitude,
          userLon: location.longitude,
          forceRefresh,
          signal,
        });

        if (!signal?.aborted) {
          setRawDisasters(data);
          setIsStale(data.some((d) => d.isStale));
          setLastFetchedAt(new Date().toISOString());
        }
      } catch (err: unknown) {
        if (!signal?.aborted) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load global disaster surveillance feed.";
          setError(message);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [statusFilter, days, location.latitude, location.longitude]
  );

  // Trigger fetch on mount or status/days change
  React.useEffect(() => {
    if (!autoFetch) return;

    const controller = new AbortController();
    loadDisasters(false, controller.signal);

    return () => {
      controller.abort();
    };
  }, [autoFetch, loadDisasters]);

  // Client-side category, search, and distance filtering
  const filteredDisasters = React.useMemo(() => {
    return rawDisasters.filter((item) => {
      // Category filter
      if (categoryFilter !== "all" && item.categoryKey !== categoryFilter) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCat = item.categoryTitle.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesSource = item.primarySource.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesDesc && !matchesSource) {
          return false;
        }
      }

      return true;
    });
  }, [rawDisasters, categoryFilter, searchQuery]);

  // Category counts dictionary
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: rawDisasters.length };
    for (const d of rawDisasters) {
      counts[d.categoryKey] = (counts[d.categoryKey] || 0) + 1;
    }
    return counts;
  }, [rawDisasters]);

  // MapLibre GeoJSON FeatureCollection
  const geoJson = React.useMemo(() => {
    return globalDisastersToGeoJson(filteredDisasters);
  }, [filteredDisasters]);

  // Sorted nearby events (closest first)
  const nearbyDisasters = React.useMemo(() => {
    return [...filteredDisasters]
      .filter((d) => typeof d.distanceKm === "number")
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [filteredDisasters]);

  // Most severe event in current filter
  const mostSevereDisaster = React.useMemo(() => {
    if (filteredDisasters.length === 0) return null;
    const severityRank: Record<string, number> = {
      CRITICAL: 5,
      HIGH: 4,
      MODERATE: 3,
      GUARDED: 2,
      LOW: 1,
    };
    return [...filteredDisasters].sort(
      (a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)
    )[0];
  }, [filteredDisasters]);

  const refresh = React.useCallback(async () => {
    await loadDisasters(true);
  }, [loadDisasters]);

  return {
    disasters: filteredDisasters,
    rawCount: rawDisasters.length,
    geoJson,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    days,
    setDays,
    searchQuery,
    setSearchQuery,
    selectedDisaster,
    setSelectedDisaster,
    nearbyDisasters,
    mostSevereDisaster,
    categoryCounts,
    isLoading,
    error,
    isStale,
    lastFetchedAt,
    refresh,
  };
}
