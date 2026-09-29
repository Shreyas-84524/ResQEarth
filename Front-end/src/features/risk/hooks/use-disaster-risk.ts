"use client";

import * as React from "react";
import { useGeolocation } from "@/features/map";
import { useWeather } from "@/features/weather";
import { useUnifiedDisasters } from "@/features/disasters";
import { calculateDisasterRisk } from "../services/risk-engine-service";
import type { RiskAssessment } from "../types";

export interface UseDisasterRiskReturn {
  assessment: RiskAssessment;
  isLoading: boolean;
  isWeatherLoading: boolean;
  isDisastersLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook that integrates live geolocation, ambient weather telemetry,
 * and unified multi-hazard disaster events into an explainable deterministic risk score.
 */
export function useDisasterRisk(): UseDisasterRiskReturn {
  const { location } = useGeolocation();
  const {
    weather,
    isLoading: isWeatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeather();
  const {
    disasters,
    isLoading: isDisastersLoading,
    error: disastersError,
    refresh: refreshDisasters,
  } = useUnifiedDisasters();

  const assessment = React.useMemo(() => {
    return calculateDisasterRisk({
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city,
            state: location.state,
            country: location.country,
          }
        : null,
      weather,
      disasters,
      isWeatherLoading,
      isDisastersLoading,
      weatherError,
      disastersError,
    });
  }, [
    location,
    weather,
    disasters,
    isWeatherLoading,
    isDisastersLoading,
    weatherError,
    disastersError,
  ]);

  const refreshAll = React.useCallback(async () => {
    await Promise.all([refreshWeather(), refreshDisasters()]);
  }, [refreshWeather, refreshDisasters]);

  return {
    assessment,
    isLoading: isWeatherLoading || isDisastersLoading,
    isWeatherLoading,
    isDisastersLoading,
    error: weatherError || disastersError || null,
    refresh: refreshAll,
  };
}
