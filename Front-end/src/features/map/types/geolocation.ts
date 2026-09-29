/**
 * ResQEarth Geolocation and Region Resolution Types
 */

import type { LngLat } from "./map";

export type LocationSource = "gps" | "manual" | "fallback";

export type GeolocationPermission =
  | "prompt"
  | "granted"
  | "denied"
  | "unavailable"
  | "timeout";

export interface NormalizedLocation {
  locality: string;
  city: string;
  district: string;
  state: string;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  source: LocationSource;
  timestamp: string;
  postalCode?: string;
}

export interface ManualCityPreset {
  id: string;
  name: string;
  district: string;
  state: string;
  country: string;
  coordinates: LngLat; // [lng, lat]
  isHighRiskZone?: boolean;
  primaryHazard?: string;
}

export interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  residential?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  district?: string;
  state_district?: string;
  state?: string;
  country?: string;
  postcode?: string;
  country_code?: string;
  [key: string]: string | undefined;
}

export interface NominatimReverseResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
  error?: string;
}

export interface LocationContextValue {
  location: NormalizedLocation;
  permission: GeolocationPermission;
  isLocating: boolean;
  isGeocoding: boolean;
  error: string | null;
  requestGpsLocation: () => Promise<NormalizedLocation | null>;
  setManualLocation: (
    target: ManualCityPreset | { lat: number; lng: number; name?: string }
  ) => Promise<NormalizedLocation>;
  resetToDefault: () => void;
}
