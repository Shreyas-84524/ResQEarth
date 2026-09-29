import type {
  NormalizedLocation,
  NominatimReverseResponse,
  ManualCityPreset,
  LocationSource,
} from "../types/geolocation";
import { NOMINATIM_CONFIG, PRESET_INDIAN_CITIES } from "../constants/geolocation-defaults";
import { calculateHaversineDistanceKm } from "./geojson-helper";

// In-memory cache for reverse geocoding results
const geocodeCache = new Map<
  string,
  { location: NormalizedLocation; timestamp: number }
>();

// Timestamp of the last network call to Nominatim to enforce 1 req/sec policy
let lastRequestTimestamp = 0;

/**
 * Finds the closest preset Indian city for a given coordinate pair (Offline Fallback)
 */
export function findNearestPresetCity(
  latitude: number,
  longitude: number
): { city: ManualCityPreset; distanceKm: number } {
  let nearestCity = PRESET_INDIAN_CITIES[0];
  let minDistance = Infinity;

  for (const preset of PRESET_INDIAN_CITIES) {
    const dist = calculateHaversineDistanceKm(
      [longitude, latitude],
      preset.coordinates
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = preset;
    }
  }

  return {
    city: nearestCity,
    distanceKm: minDistance,
  };
}

/**
 * Normalizes raw Nominatim address components into structured NormalizedLocation
 */
export function normalizeNominatimAddress(
  data: NominatimReverseResponse,
  latitude: number,
  longitude: number,
  accuracyMeters?: number,
  source: LocationSource = "gps"
): NormalizedLocation {
  const addr = data.address || {};

  const locality =
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.city_district ||
    addr.village ||
    addr.town ||
    "Local Area";

  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.county ||
    locality;

  const district =
    addr.district ||
    addr.city_district ||
    addr.state_district ||
    addr.county ||
    city;

  const state = addr.state || "Maharashtra";
  const country = addr.country || "India";

  // Build clean, deduplicated formatted address
  const parts = [locality, city !== locality ? city : null, district !== city ? district : null, state, country].filter(
    Boolean
  );
  const formattedAddress = parts.join(", ");

  return {
    locality,
    city,
    district,
    state,
    country,
    formattedAddress,
    latitude,
    longitude,
    accuracyMeters,
    source,
    timestamp: new Date().toISOString(),
    postalCode: addr.postcode,
  };
}

/**
 * Enforces rate limiting delay if required
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTimestamp;
  if (timeSinceLast < NOMINATIM_CONFIG.rateLimitDelayMs) {
    const waitTime = NOMINATIM_CONFIG.rateLimitDelayMs - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTimestamp = Date.now();
}

/**
 * Reverse geocodes a geographic coordinate into a NormalizedLocation using OSM Nominatim
 * with rate limiting, caching, and offline Indian city fallback.
 */
export async function reverseGeocodeCoordinate(
  latitude: number,
  longitude: number,
  accuracyMeters?: number,
  source: LocationSource = "gps"
): Promise<NormalizedLocation> {
  // 1. Check in-memory cache (~100m precision with 3 decimal places)
  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const cached = geocodeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < NOMINATIM_CONFIG.cacheTtlMs) {
    return {
      ...cached.location,
      latitude,
      longitude,
      accuracyMeters,
      source,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // 2. Enforce 1 req/sec policy
    await enforceRateLimit();

    // 3. Fetch from OpenStreetMap Nominatim
    const url = `${NOMINATIM_CONFIG.baseUrl}?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_CONFIG.timeoutMs);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim HTTP ${response.status}`);
    }

    const data: NominatimReverseResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const normalized = normalizeNominatimAddress(
      data,
      latitude,
      longitude,
      accuracyMeters,
      source
    );

    // Save in cache
    geocodeCache.set(cacheKey, {
      location: normalized,
      timestamp: Date.now(),
    });

    return normalized;
  } catch (err) {
    console.warn("Reverse geocoding network lookup failed; using nearest preset fallback:", err);

    // 4. Offline Fallback to closest known Indian city
    const nearest = findNearestPresetCity(latitude, longitude);
    const fallbackLocation: NormalizedLocation = {
      locality: `${nearest.city.name} Vicinity (${Math.round(nearest.distanceKm)}km)`,
      city: nearest.city.name,
      district: nearest.city.district,
      state: nearest.city.state,
      country: nearest.city.country,
      formattedAddress: `${nearest.city.name}, ${nearest.city.district}, ${nearest.city.state}, India`,
      latitude,
      longitude,
      accuracyMeters: accuracyMeters || (nearest.distanceKm * 1000),
      source,
      timestamp: new Date().toISOString(),
    };

    return fallbackLocation;
  }
}

/**
 * Creates NormalizedLocation directly from a manual city preset
 */
export function manualCityToNormalizedLocation(
  city: ManualCityPreset
): NormalizedLocation {
  const [lon, lat] = city.coordinates;
  return {
    locality: city.name,
    city: city.name,
    district: city.district,
    state: city.state,
    country: city.country,
    formattedAddress: `${city.name}, ${city.district}, ${city.state}, ${city.country}`,
    latitude: lat,
    longitude: lon,
    accuracyMeters: 100,
    source: "manual",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clears the reverse geocode cache (used for testing)
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}
