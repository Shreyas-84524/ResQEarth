"use client";

import * as React from "react";
import type {
  NormalizedLocation,
  GeolocationPermission,
  ManualCityPreset,
  LocationContextValue,
} from "../types/geolocation";
import { DEFAULT_FALLBACK_LOCATION } from "../constants/geolocation-defaults";
import {
  checkGeolocationPermission,
  getCurrentBrowserPosition,
  getSavedSessionLocation,
  saveSessionLocation,
  clearSessionLocation,
} from "../services/geolocation-service";
import {
  reverseGeocodeCoordinate,
  manualCityToNormalizedLocation,
} from "../services/reverse-geocoding";

export const LocationContext = React.createContext<LocationContextValue | null>(null);

export interface LocationProviderProps {
  children: React.ReactNode;
  initialLocation?: NormalizedLocation;
}

export function LocationProvider({
  children,
  initialLocation = DEFAULT_FALLBACK_LOCATION,
}: LocationProviderProps) {
  const [location, setLocation] = React.useState<NormalizedLocation>(() => {
    // Attempt hydration from sessionStorage on client, else fallback
    const saved = getSavedSessionLocation();
    return saved || initialLocation;
  });

  const [permission, setPermission] =
    React.useState<GeolocationPermission>("prompt");
  const [isLocating, setIsLocating] = React.useState(false);
  const [isGeocoding, setIsGeocoding] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check initial browser permission on mount
  React.useEffect(() => {
    checkGeolocationPermission().then((status) => {
      setPermission(status);
    });

    const saved = getSavedSessionLocation();
    if (saved) {
      setLocation(saved);
    }
  }, []);

  // Request browser GPS position and resolve region via Nominatim
  const requestGpsLocation = React.useCallback(async (): Promise<NormalizedLocation | null> => {
    setIsLocating(true);
    setError(null);

    try {
      const coords = await getCurrentBrowserPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      });

      setPermission("granted");
      setIsGeocoding(true);

      const resolved = await reverseGeocodeCoordinate(
        coords.latitude,
        coords.longitude,
        coords.accuracy,
        "gps"
      );

      setLocation(resolved);
      saveSessionLocation(resolved);
      setIsGeocoding(false);
      setIsLocating(false);
      return resolved;
    } catch (err: unknown) {
      setIsLocating(false);
      setIsGeocoding(false);

      const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";

      if (message === "PERMISSION_DENIED") {
        setPermission("denied");
        setError("Location access denied by user. Using manual/fallback location.");
      } else if (message === "POSITION_UNAVAILABLE") {
        setPermission("unavailable");
        setError("GPS position unavailable on this network/device.");
      } else if (message === "TIMEOUT") {
        setPermission("timeout");
        setError("GPS request timed out. Please retry or select your region manually.");
      } else {
        setPermission("unavailable");
        setError("Could not determine current location.");
      }
      return null;
    }
  }, []);

  // Set manual location either by city preset or specific coordinates
  const setManualLocation = React.useCallback(
    async (
      target: ManualCityPreset | { lat: number; lng: number; name?: string }
    ): Promise<NormalizedLocation> => {
      setError(null);

      if ("coordinates" in target) {
        // Direct preset
        const resolved = manualCityToNormalizedLocation(target);
        setLocation(resolved);
        saveSessionLocation(resolved);
        return resolved;
      }

      // Lat/Lng with reverse geocode lookup
      setIsGeocoding(true);
      const resolved = await reverseGeocodeCoordinate(
        target.lat,
        target.lng,
        100,
        "manual"
      );
      if (target.name) {
        resolved.locality = target.name;
        resolved.city = target.name;
      }
      setLocation(resolved);
      saveSessionLocation(resolved);
      setIsGeocoding(false);
      return resolved;
    },
    []
  );

  // Reset to default Mumbai location
  const resetToDefault = React.useCallback(() => {
    setLocation(DEFAULT_FALLBACK_LOCATION);
    clearSessionLocation();
    setError(null);
  }, []);

  const value = React.useMemo<LocationContextValue>(
    () => ({
      location,
      permission,
      isLocating,
      isGeocoding,
      error,
      requestGpsLocation,
      setManualLocation,
      resetToDefault,
    }),
    [
      location,
      permission,
      isLocating,
      isGeocoding,
      error,
      requestGpsLocation,
      setManualLocation,
      resetToDefault,
    ]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
