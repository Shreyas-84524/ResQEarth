import type {
  NormalizedLocation,
  GeolocationPermission,
} from "../types/geolocation";
import { LOCATION_STORAGE_KEY } from "../constants/geolocation-defaults";
import { reverseGeocodeCoordinate } from "./reverse-geocoding";

export interface GetPositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Checks the browser's current geolocation permission state without prompting
 */
export async function checkGeolocationPermission(): Promise<GeolocationPermission> {
  if (typeof window === "undefined" || !("navigator" in window)) {
    return "unavailable";
  }

  if (!("geolocation" in navigator)) {
    return "unavailable";
  }

  if ("permissions" in navigator && typeof navigator.permissions.query === "function") {
    try {
      const status = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      if (status.state === "granted") return "granted";
      if (status.state === "denied") return "denied";
      return "prompt";
    } catch {
      // Some browsers do not support querying geolocation permissions
      return "prompt";
    }
  }

  return "prompt";
}

/**
 * Requests the device's current GPS position via browser Geolocation API
 */
export function getCurrentBrowserPosition(
  options: GetPositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
  }
): Promise<{ latitude: number; longitude: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("GEOLOCATION_UNAVAILABLE"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("PERMISSION_DENIED"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("POSITION_UNAVAILABLE"));
            break;
          case error.TIMEOUT:
            reject(new Error("TIMEOUT"));
            break;
          default:
            reject(new Error("UNKNOWN_ERROR"));
            break;
        }
      },
      options
    );
  });
}

/**
 * Executes a full GPS location resolution flow:
 * 1. Requests browser position
 * 2. Reverse geocodes the coordinates via Nominatim
 * 3. Returns the structured NormalizedLocation
 */
export async function resolveGpsLocation(): Promise<NormalizedLocation> {
  const coords = await getCurrentBrowserPosition();
  return await reverseGeocodeCoordinate(
    coords.latitude,
    coords.longitude,
    coords.accuracy,
    "gps"
  );
}

/**
 * Reads the persisted location from sessionStorage
 */
export function getSavedSessionLocation(): NormalizedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.latitude === "number" &&
      typeof parsed.longitude === "number" &&
      parsed.formattedAddress
    ) {
      return parsed as NormalizedLocation;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves the active location into sessionStorage for current session persistence
 */
export function saveSessionLocation(location: NormalizedLocation): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch (err) {
    console.warn("Failed to write location to sessionStorage:", err);
  }
}

/**
 * Clears saved session location
 */
export function clearSessionLocation(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {}
}
