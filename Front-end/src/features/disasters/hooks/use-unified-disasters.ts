"use client";

import * as React from "react";
import { useGeolocation } from "@/features/map";
import {
  fetchUnifiedDisasters,
  filterUnifiedDisasters,
  unifiedDisastersToGeoJson,
} from "../services/unified-disaster-service";
import type {
  UnifiedDisasterEvent,
  UnifiedDisasterCategory,
  DisasterProvider,
  DisasterSourceType,
  DisasterTimeWindow,
  UnifiedDisasterFilterOptions,
} from "../types/disaster-event";
import type { RiskLevel } from "@/types";

export interface UseUnifiedDisastersReturn {
  disasters: UnifiedDisasterEvent[];
  filteredDisasters: UnifiedDisasterEvent[];
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Point>;
  selectedDisaster: UnifiedDisasterEvent | null;
  setSelectedDisaster: (disaster: UnifiedDisasterEvent | null) => void;
  // Filters
  categoryFilter: UnifiedDisasterCategory;
  setCategoryFilter: (cat: UnifiedDisasterCategory) => void;
  providerFilter: DisasterProvider | "all";
  setProviderFilter: (provider: DisasterProvider | "all") => void;
  sourceTypeFilter: DisasterSourceType | "all";
  setSourceTypeFilter: (st: DisasterSourceType | "all") => void;
  minSeverity: RiskLevel | "all";
  setMinSeverity: (sev: RiskLevel | "all") => void;
  timeWindow: DisasterTimeWindow;
  setTimeWindow: (tw: DisasterTimeWindow) => void;
  officialOnly: boolean;
  setOfficialOnly: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  maxDistanceKm?: number;
  setMaxDistanceKm: (dist: number | undefined) => void;
  resetFilters: () => void;
  // Summary metrics
  categoryCounts: Record<UnifiedDisasterCategory, number>;
  officialCount: number;
  criticalCount: number;
  nearbyDisasters: UnifiedDisasterEvent[];
  mostSevereDisaster: UnifiedDisasterEvent | null;
  // States
  isLoading: boolean;
  error: string | null;
  isStale: boolean;
  refresh: () => Promise<void>;
}

export function useUnifiedDisasters(): UseUnifiedDisastersReturn {
  const { location } = useGeolocation();
  const [disasters, setDisasters] = React.useState<UnifiedDisasterEvent[]>([]);
  const [selectedDisaster, setSelectedDisaster] = React.useState<UnifiedDisasterEvent | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isStale, setIsStale] = React.useState<boolean>(false);

  // Filter States
  const [categoryFilter, setCategoryFilter] = React.useState<UnifiedDisasterCategory>("all");
  const [providerFilter, setProviderFilter] = React.useState<DisasterProvider | "all">("all");
  const [sourceTypeFilter, setSourceTypeFilter] = React.useState<DisasterSourceType | "all">("all");
  const [minSeverity, setMinSeverity] = React.useState<RiskLevel | "all">("all");
  const [timeWindow, setTimeWindow] = React.useState<DisasterTimeWindow>("all");
  const [officialOnly, setOfficialOnly] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [maxDistanceKm, setMaxDistanceKm] = React.useState<number | undefined>(undefined);

  const resetFilters = React.useCallback(() => {
    setCategoryFilter("all");
    setProviderFilter("all");
    setSourceTypeFilter("all");
    setMinSeverity("all");
    setTimeWindow("all");
    setOfficialOnly(false);
    setSearchQuery("");
    setMaxDistanceKm(undefined);
  }, []);

  const loadData = React.useCallback(
    async (forceRefresh = false, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const events = await fetchUnifiedDisasters({
          userLat: location.latitude,
          userLon: location.longitude,
          forceRefresh,
          signal,
        });

        setDisasters(events);
        setIsStale(events.some((e) => e.isStale));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load multi-hazard feeds.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [location.latitude, location.longitude]
  );

  // Initial fetch and on location coordinate change
  React.useEffect(() => {
    const controller = new AbortController();
    loadData(false, controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadData]);

  // Compute filtered disasters
  const filterOptions: UnifiedDisasterFilterOptions = React.useMemo(
    () => ({
      category: categoryFilter,
      provider: providerFilter,
      sourceType: sourceTypeFilter,
      minSeverity,
      timeWindow,
      officialOnly,
      searchQuery,
      maxDistanceKm,
      status: "all",
    }),
    [
      categoryFilter,
      providerFilter,
      sourceTypeFilter,
      minSeverity,
      timeWindow,
      officialOnly,
      searchQuery,
      maxDistanceKm,
    ]
  );

  const filteredDisasters = React.useMemo(
    () => filterUnifiedDisasters(disasters, filterOptions),
    [disasters, filterOptions]
  );

  // Generate MapLibre GeoJSON
  const geoJson = React.useMemo(
    () => unifiedDisastersToGeoJson(filteredDisasters),
    [filteredDisasters]
  );

  // Compute active counts for category badges
  const categoryCounts = React.useMemo(() => {
    const counts: Record<UnifiedDisasterCategory, number> = {
      all: disasters.length,
      officialAlerts: 0,
      earthquakes: 0,
      wildfires: 0,
      severeStorms: 0,
      floods: 0,
      landslides: 0,
      volcanoes: 0,
      weatherAlerts: 0,
    };

    for (const d of disasters) {
      if (d.isOfficialAlert) {
        counts.officialAlerts++;
      }
      if (d.categoryKey && d.categoryKey in counts && d.categoryKey !== "all") {
        counts[d.categoryKey]++;
      }
    }

    return counts;
  }, [disasters]);

  const officialCount = categoryCounts.officialAlerts;
  const criticalCount = React.useMemo(
    () => disasters.filter((d) => d.severity === "CRITICAL").length,
    [disasters]
  );

  // Sorted by distance relative to user
  const nearbyDisasters = React.useMemo(() => {
    return [...disasters]
      .filter((d) => typeof d.distanceKm === "number")
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  }, [disasters]);

  // Most severe disaster
  const mostSevereDisaster = React.useMemo(() => {
    if (disasters.length === 0) return null;
    return disasters[0]; // Already sorted with highest severity and official alerts at the top
  }, [disasters]);

  const refresh = React.useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    disasters,
    filteredDisasters,
    geoJson,
    selectedDisaster,
    setSelectedDisaster,
    categoryFilter,
    setCategoryFilter,
    providerFilter,
    setProviderFilter,
    sourceTypeFilter,
    setSourceTypeFilter,
    minSeverity,
    setMinSeverity,
    timeWindow,
    setTimeWindow,
    officialOnly,
    setOfficialOnly,
    searchQuery,
    setSearchQuery,
    maxDistanceKm,
    setMaxDistanceKm,
    resetFilters,
    categoryCounts,
    officialCount,
    criticalCount,
    nearbyDisasters,
    mostSevereDisaster,
    isLoading,
    error,
    isStale,
    refresh,
  };
}
