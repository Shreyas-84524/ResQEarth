import { calculateHaversineDistanceKm } from "@/features/map/services/geojson-helper";
import { fetchEarthquakes } from "./earthquake-service";
import { fetchGlobalDisasters } from "./global-disaster-service";
import { fetchIndianOfficialAlerts } from "./indian-alert-service";
import { fetchWeather } from "@/features/weather/services/weather-service";
import {
  UNIFIED_DISASTER_CONFIG,
  getUnifiedDisasterMarkerRadius,
  SEVERE_WEATHER_THRESHOLDS,
} from "../constants/unified-disaster-config";
import type { NormalizedEarthquake } from "../types/earthquake";
import type { NormalizedGlobalDisaster } from "../types/global-disaster";
import type { NormalizedWeather } from "@/features/weather/types/weather";
import type {
  UnifiedDisasterEvent,
  UnifiedDisasterFilterOptions,
  UnifiedDisasterFetchOptions,
  UnifiedDisasterGeoJsonFeature,
  UnifiedDisasterCategory,
} from "../types/disaster-event";
import type { RiskLevel } from "@/types";

// In-memory cache for unified multi-hazard feed
const unifiedDisasterCache = new Map<
  string,
  { data: UnifiedDisasterEvent[]; timestamp: number }
>();
const inFlightUnifiedRequests = new Map<string, Promise<UnifiedDisasterEvent[]>>();

/**
 * Validates WGS84 coordinates
 */
function isValidCoord(lon: number, lat: number): boolean {
  return (
    typeof lon === "number" &&
    typeof lat === "number" &&
    !Number.isNaN(lon) &&
    !Number.isNaN(lat) &&
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Maps risk levels to integer rank for severity filtering & deduplication
 */
const SEVERITY_RANK: Record<RiskLevel, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MODERATE: 3,
  GUARDED: 2,
  LOW: 1,
};

/**
 * Converts a NormalizedEarthquake into a canonical UnifiedDisasterEvent
 */
export function earthquakeToUnifiedEvent(
  eq: NormalizedEarthquake,
  userLat?: number,
  userLon?: number
): UnifiedDisasterEvent {
  let distanceKm = eq.distanceKm;
  if (typeof userLat === "number" && typeof userLon === "number" && isValidCoord(userLon, userLat)) {
    distanceKm = Math.round(calculateHaversineDistanceKm([userLon, userLat], [eq.longitude, eq.latitude]));
  }

  return {
    id: eq.id,
    provider: "usgs",
    providerEventId: eq.providerEventId,
    disasterType: "earthquake",
    categoryKey: "earthquakes",
    categoryTitle: "Earthquake",
    title: eq.title,
    description: `M ${eq.magnitude.toFixed(1)} seismic event at focal depth ${eq.depthKm} km near ${eq.place}.${eq.tsunamiAlert ? " Tsunami alert active." : ""}`,
    severity: eq.severity,
    severityScale: eq.severityScale,
    sourceType: "official",
    sourceName: eq.source,
    sourceUrl: eq.sourceUrl,
    isOfficialAlert: false, // USGS is official telemetry, not statutory emergency decree
    latitude: eq.latitude,
    longitude: eq.longitude,
    coordinates: [eq.longitude, eq.latitude],
    geometryType: "Point",
    region: eq.place,
    occurredAt: eq.occurredAt,
    updatedAt: eq.updatedAt,
    isOpen: true,
    distanceKm,
    magnitudeValue: eq.magnitude,
    magnitudeUnit: "Mw",
    depthKm: eq.depthKm,
    tsunamiAlert: eq.tsunamiAlert,
    isStale: eq.isStale,
  };
}

/**
 * Converts a NormalizedGlobalDisaster into a canonical UnifiedDisasterEvent
 */
export function globalDisasterToUnifiedEvent(
  d: NormalizedGlobalDisaster,
  userLat?: number,
  userLon?: number
): UnifiedDisasterEvent {
  let distanceKm = d.distanceKm;
  if (typeof userLat === "number" && typeof userLon === "number" && isValidCoord(userLon, userLat)) {
    distanceKm = Math.round(calculateHaversineDistanceKm([userLon, userLat], [d.longitude, d.latitude]));
  }

  let categoryKey: UnifiedDisasterCategory = "all";
  if (d.categoryKey === "wildfires") categoryKey = "wildfires";
  else if (d.categoryKey === "severeStorms") categoryKey = "severeStorms";
  else if (d.categoryKey === "volcanoes") categoryKey = "volcanoes";
  else if (d.categoryKey === "floods") categoryKey = "floods";
  else if (d.categoryKey === "landslides") categoryKey = "landslides";
  else if (d.categoryKey === "earthquakes") categoryKey = "earthquakes";

  return {
    id: d.id,
    provider: "nasa-eonet",
    providerEventId: d.providerEventId,
    disasterType: d.disasterType,
    categoryKey,
    categoryTitle: d.categoryTitle,
    title: d.title,
    description: d.description || `${d.categoryTitle} monitored by ${d.primarySource.name || "NASA EONET"}.`,
    severity: d.severity,
    severityScale: d.severityScale,
    sourceType: "automatic",
    sourceName: `NASA EONET (${d.primarySource.name})`,
    sourceUrl: d.sourceUrl,
    isOfficialAlert: false,
    latitude: d.latitude,
    longitude: d.longitude,
    coordinates: [d.longitude, d.latitude],
    geometryType: d.geometryType,
    region: d.title,
    occurredAt: d.occurredAt,
    updatedAt: d.updatedAt,
    isOpen: d.isOpen,
    distanceKm,
    magnitudeValue: d.magnitudeValue,
    magnitudeUnit: d.magnitudeUnit,
    isStale: d.isStale,
  };
}

/**
 * Extracts severe weather hazard events from Open-Meteo telemetry when thresholds are exceeded
 */
export function weatherToUnifiedEvents(
  weather: NormalizedWeather,
  userLat?: number,
  userLon?: number
): UnifiedDisasterEvent[] {
  if (!weather) return [];

  const events: UnifiedDisasterEvent[] = [];
  const lat = weather.latitude;
  const lon = weather.longitude;
  const locationName = weather.locationName || "Local Region";

  let distanceKm: number | undefined;
  if (typeof userLat === "number" && typeof userLon === "number" && isValidCoord(userLon, userLat)) {
    distanceKm = Math.round(calculateHaversineDistanceKm([userLon, userLat], [lon, lat]));
  }

  // 1. Extreme Rainfall / Flood Potential
  if (weather.precipitation >= SEVERE_WEATHER_THRESHOLDS.heavyRainMm) {
    events.push({
      id: `wx-heavy-rain-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      provider: "open-meteo",
      providerEventId: `heavy-rain-${Date.now()}`,
      disasterType: "heavy-rain",
      categoryKey: "weatherAlerts",
      categoryTitle: "Heavy Precipitation",
      title: `Intense Rainfall Warning (${weather.precipitation} mm/hr)`,
      description: `Observed local rainfall rate of ${weather.precipitation} mm/hr exceeds severe drainage thresholds in ${locationName}. High localized flood risk.`,
      severity: weather.precipitation >= 50 ? "CRITICAL" : "HIGH",
      severityScale: "Open-Meteo Telemetry (mm/hr)",
      sourceType: "automatic",
      sourceName: "Open-Meteo High-Resolution Model",
      sourceUrl: weather.sourceUrl,
      isOfficialAlert: false,
      latitude: lat,
      longitude: lon,
      coordinates: [lon, lat],
      geometryType: "Point",
      region: locationName,
      occurredAt: weather.updatedAt,
      updatedAt: weather.updatedAt,
      isOpen: true,
      distanceKm,
      isStale: weather.isStale,
    });
  }

  // 2. High Wind Gusts / Squalls
  if (weather.windGusts >= SEVERE_WEATHER_THRESHOLDS.highWindGustsKmh) {
    events.push({
      id: `wx-high-wind-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      provider: "open-meteo",
      providerEventId: `high-wind-${Date.now()}`,
      disasterType: "high-wind",
      categoryKey: "weatherAlerts",
      categoryTitle: "High Wind Gusts",
      title: `Severe Wind Gust Advisory (${Math.round(weather.windGusts)} km/h)`,
      description: `Surface wind gusts reaching ${Math.round(weather.windGusts)} km/h observed in ${locationName}. Caution advised for loose structures and marine activities.`,
      severity: weather.windGusts >= 85 ? "CRITICAL" : "HIGH",
      severityScale: "Open-Meteo Wind Telemetry (km/h)",
      sourceType: "automatic",
      sourceName: "Open-Meteo High-Resolution Model",
      sourceUrl: weather.sourceUrl,
      isOfficialAlert: false,
      latitude: lat,
      longitude: lon,
      coordinates: [lon, lat],
      geometryType: "Point",
      region: locationName,
      occurredAt: weather.updatedAt,
      updatedAt: weather.updatedAt,
      isOpen: true,
      distanceKm,
      isStale: weather.isStale,
    });
  }

  // 3. Extreme Heat Wave
  if (weather.temperature >= SEVERE_WEATHER_THRESHOLDS.extremeHeatTempC) {
    events.push({
      id: `wx-heat-wave-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      provider: "open-meteo",
      providerEventId: `heat-wave-${Date.now()}`,
      disasterType: "heat-wave",
      categoryKey: "weatherAlerts",
      categoryTitle: "Extreme Heat Wave",
      title: `Extreme Temperature Advisory (${Math.round(weather.temperature)}°C)`,
      description: `Ambient temperature has reached ${Math.round(weather.temperature)}°C in ${locationName}. Elevated risk of heat exhaustion and dehydration.`,
      severity: weather.temperature >= 45 ? "CRITICAL" : "HIGH",
      severityScale: "Open-Meteo Temperature (°C)",
      sourceType: "automatic",
      sourceName: "Open-Meteo High-Resolution Model",
      sourceUrl: weather.sourceUrl,
      isOfficialAlert: false,
      latitude: lat,
      longitude: lon,
      coordinates: [lon, lat],
      geometryType: "Point",
      region: locationName,
      occurredAt: weather.updatedAt,
      updatedAt: weather.updatedAt,
      isOpen: true,
      distanceKm,
      isStale: weather.isStale,
    });
  }

  return events;
}

/**
 * Deduplicates events across providers based on exact IDs and spatial/temporal proximity
 */
export function deduplicateDisasters(events: UnifiedDisasterEvent[]): UnifiedDisasterEvent[] {
  const seenIds = new Set<string>();
  const deduplicated: UnifiedDisasterEvent[] = [];

  for (const event of events) {
    if (!event || !isValidCoord(event.longitude, event.latitude)) continue;

    // 1. Exact ID match
    if (seenIds.has(event.id) || (event.providerEventId && seenIds.has(`${event.provider}:${event.providerEventId}`))) {
      continue;
    }

    // 2. Spatial & Temporal proximity deduplication
    // Check if there is an existing event of the same disasterType within 15 km and 6 hours
    const eventTime = new Date(event.occurredAt).getTime();
    let isDuplicate = false;

    for (let i = 0; i < deduplicated.length; i++) {
      const existing = deduplicated[i];
      if (existing.disasterType === event.disasterType) {
        const existingTime = new Date(existing.occurredAt).getTime();
        const timeDiff = Math.abs(eventTime - existingTime);

        if (timeDiff <= UNIFIED_DISASTER_CONFIG.deduplicationTimeWindowMs) {
          const dist = calculateHaversineDistanceKm(
            [event.longitude, event.latitude],
            [existing.longitude, existing.latitude]
          );

          if (dist <= UNIFIED_DISASTER_CONFIG.deduplicationDistanceKm) {
            // Found duplicate. Keep the event with higher severity or official provenance
            isDuplicate = true;
            if (
              (event.isOfficialAlert && !existing.isOfficialAlert) ||
              SEVERITY_RANK[event.severity] > SEVERITY_RANK[existing.severity]
            ) {
              deduplicated[i] = event; // Replace with more authoritative / severe event
            }
            break;
          }
        }
      }
    }

    if (!isDuplicate) {
      seenIds.add(event.id);
      if (event.providerEventId) {
        seenIds.add(`${event.provider}:${event.providerEventId}`);
      }
      deduplicated.push(event);
    }
  }

  return deduplicated;
}

/**
 * Filters unified disaster events according to user-selected criteria
 */
export function filterUnifiedDisasters(
  events: UnifiedDisasterEvent[],
  filters: UnifiedDisasterFilterOptions
): UnifiedDisasterEvent[] {
  if (!events || events.length === 0) return [];

  const now = Date.now();

  return events.filter((event) => {
    // 1. Category filter
    if (filters.category && filters.category !== "all") {
      if (filters.category === "officialAlerts") {
        if (!event.isOfficialAlert) return false;
      } else if (event.categoryKey !== filters.category) {
        return false;
      }
    }

    // 2. Provider filter
    if (filters.provider && filters.provider !== "all") {
      if (event.provider !== filters.provider) return false;
    }

    // 3. Source Type filter
    if (filters.sourceType && filters.sourceType !== "all") {
      if (event.sourceType !== filters.sourceType) return false;
    }

    // 4. Min Severity filter
    if (filters.minSeverity && filters.minSeverity !== "all") {
      const minRank = SEVERITY_RANK[filters.minSeverity] ?? 1;
      const eventRank = SEVERITY_RANK[event.severity] ?? 1;
      if (eventRank < minRank) return false;
    }

    // 5. Official Only filter
    if (filters.officialOnly && !event.isOfficialAlert) {
      return false;
    }

    // 6. Status filter (open vs all)
    if (filters.status === "open" && !event.isOpen) {
      return false;
    }

    // 7. Max Distance filter
    if (typeof filters.maxDistanceKm === "number") {
      if (typeof event.distanceKm !== "number" || event.distanceKm > filters.maxDistanceKm) {
        return false;
      }
    }

    // 8. Time Window filter
    if (filters.timeWindow && filters.timeWindow !== "all") {
      const eventTime = new Date(event.occurredAt).getTime();
      const elapsedMs = now - eventTime;

      switch (filters.timeWindow) {
        case "1h":
          if (elapsedMs > 3600 * 1000) return false;
          break;
        case "24h":
          if (elapsedMs > 24 * 3600 * 1000) return false;
          break;
        case "48h":
          if (elapsedMs > 48 * 3600 * 1000) return false;
          break;
        case "7d":
          if (elapsedMs > 7 * 24 * 3600 * 1000) return false;
          break;
      }
    }

    // 9. Search Query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchesTitle = event.title.toLowerCase().includes(q);
      const matchesRegion = event.region.toLowerCase().includes(q);
      const matchesSource = event.sourceName.toLowerCase().includes(q);
      const matchesType = event.disasterType.toLowerCase().includes(q);
      const matchesDesc = event.description ? event.description.toLowerCase().includes(q) : false;

      if (!matchesTitle && !matchesRegion && !matchesSource && !matchesType && !matchesDesc) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Converts UnifiedDisasterEvent list into a MapLibre-ready GeoJSON FeatureCollection
 */
export function unifiedDisastersToGeoJson(
  disasters: UnifiedDisasterEvent[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: UnifiedDisasterGeoJsonFeature[] = disasters.map((d) => ({
    type: "Feature",
    id: d.id,
    geometry: {
      type: "Point",
      coordinates: [d.longitude, d.latitude],
    },
    properties: {
      id: d.id,
      title: d.title,
      disasterType: d.disasterType,
      categoryKey: d.categoryKey,
      categoryTitle: d.categoryTitle,
      severity: d.severity,
      provider: d.provider,
      sourceType: d.sourceType,
      sourceName: d.sourceName,
      sourceUrl: d.sourceUrl,
      isOfficialAlert: d.isOfficialAlert,
      markerRadius: getUnifiedDisasterMarkerRadius(d.severity, d.disasterType, d.magnitudeValue),
      distanceKm: d.distanceKm,
      isOpen: d.isOpen,
      occurredAt: d.occurredAt,
      region: d.region,
      category: "unified-disaster",
    },
  }));

  return {
    type: "FeatureCollection",
    features: features as unknown as GeoJSON.Feature<GeoJSON.Point>[],
  };
}

/**
 * Aggregates all live disaster feeds (USGS Earthquakes, NASA EONET, Indian Official Alerts, Open-Meteo Weather)
 * with concurrent execution, failure isolation, deduplication, and caching.
 */
export async function fetchUnifiedDisasters(
  options?: UnifiedDisasterFetchOptions
): Promise<UnifiedDisasterEvent[]> {
  const cacheKey = "unified-hazards-all";

  // 1. Check in-memory cache
  if (!options?.forceRefresh) {
    const cached = unifiedDisasterCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < UNIFIED_DISASTER_CONFIG.cacheTtlMs) {
      // Re-calculate distance relative to current user coordinates
      return cached.data.map((item) => {
        let dist = item.distanceKm;
        if (typeof options?.userLat === "number" && typeof options?.userLon === "number") {
          dist = Math.round(
            calculateHaversineDistanceKm(
              [options.userLon, options.userLat],
              [item.longitude, item.latitude]
            )
          );
        }
        return { ...item, distanceKm: dist };
      });
    }
  }

  // 2. In-flight request deduplication
  const existingPromise = inFlightUnifiedRequests.get(cacheKey);
  if (existingPromise && !options?.forceRefresh) {
    return existingPromise;
  }

  // 3. Concurrent aggregate fetch with failure isolation
  const requestPromise = (async (): Promise<UnifiedDisasterEvent[]> => {
    const rawEvents: UnifiedDisasterEvent[] = [];

    const results = await Promise.allSettled([
      // 1. USGS Earthquakes Feed
      fetchEarthquakes("day_2.5", {
        userLat: options?.userLat,
        userLon: options?.userLon,
        forceRefresh: options?.forceRefresh,
        signal: options?.signal,
      }),
      // 2. NASA EONET Global Disasters Feed
      fetchGlobalDisasters({
        status: "open",
        days: 30,
        userLat: options?.userLat,
        userLon: options?.userLon,
        forceRefresh: options?.forceRefresh,
        signal: options?.signal,
      }),
      // 3. Indian Official Statutory Alerts (NDMA SACHET / IMD)
      fetchIndianOfficialAlerts({
        userLat: options?.userLat,
        userLon: options?.userLon,
        forceRefresh: options?.forceRefresh,
        signal: options?.signal,
      }),
      // 4. Open-Meteo Weather Hazards
      fetchWeather(options?.userLat ?? 19.0760, options?.userLon ?? 72.8777, {
        forceRefresh: options?.forceRefresh,
        signal: options?.signal,
      }),
    ]);

    // Process Earthquakes
    if (results[0].status === "fulfilled" && Array.isArray(results[0].value)) {
      for (const eq of results[0].value) {
        rawEvents.push(earthquakeToUnifiedEvent(eq, options?.userLat, options?.userLon));
      }
    }

    // Process Global Disasters
    if (results[1].status === "fulfilled" && Array.isArray(results[1].value)) {
      for (const d of results[1].value) {
        rawEvents.push(globalDisasterToUnifiedEvent(d, options?.userLat, options?.userLon));
      }
    }

    // Process Indian Official Alerts
    if (results[2].status === "fulfilled" && Array.isArray(results[2].value)) {
      for (const alert of results[2].value) {
        rawEvents.push(alert);
      }
    }

    // Process Weather Telemetry Hazards
    if (results[3].status === "fulfilled" && results[3].value) {
      const wxEvents = weatherToUnifiedEvents(results[3].value, options?.userLat, options?.userLon);
      rawEvents.push(...wxEvents);
    }

    // Deduplicate multi-source events
    const deduplicated = deduplicateDisasters(rawEvents);

    // Sort: Official alerts first, then highest severity, then newest timestamp
    deduplicated.sort((a, b) => {
      if (a.isOfficialAlert && !b.isOfficialAlert) return -1;
      if (!a.isOfficialAlert && b.isOfficialAlert) return 1;

      const rankA = SEVERITY_RANK[a.severity] ?? 1;
      const rankB = SEVERITY_RANK[b.severity] ?? 1;
      if (rankB !== rankA) return rankB - rankA;

      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();
      return timeB - timeA;
    });

    // Save to cache
    unifiedDisasterCache.set(cacheKey, {
      data: deduplicated,
      timestamp: Date.now(),
    });

    return deduplicated;
  })();

  inFlightUnifiedRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } catch (err) {
    // If all fail, return stale cache if available
    const cached = unifiedDisasterCache.get(cacheKey);
    if (cached && cached.data.length > 0) {
      return cached.data.map((item) => ({ ...item, isStale: true }));
    }
    throw err;
  } finally {
    inFlightUnifiedRequests.delete(cacheKey);
  }
}

/**
 * Clears the unified disaster cache
 */
export function clearUnifiedDisasterCache(): void {
  unifiedDisasterCache.clear();
  inFlightUnifiedRequests.clear();
}
