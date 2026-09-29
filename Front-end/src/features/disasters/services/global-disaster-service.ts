import { calculateHaversineDistanceKm } from "@/features/map/services/geojson-helper";
import {
  EONET_CONFIG,
  mapEonetCategoryToCanonicalType,
  calculateEonetSeverity,
  getGlobalDisasterMarkerRadius,
} from "../constants/global-disaster-config";
import type {
  NormalizedGlobalDisaster,
  EonetGeoJsonFeature,
  EonetGeoJsonResponse,
  EonetRawEvent,
  EonetRawGeometryItem,
  EonetEventsResponse,
  GlobalDisasterFetchOptions,
  GlobalDisasterGeoJsonFeature,
} from "../types/global-disaster";

// In-memory cache and in-flight request maps
const globalDisasterCache = new Map<
  string,
  { data: NormalizedGlobalDisaster[]; timestamp: number }
>();
const inFlightRequests = new Map<string, Promise<NormalizedGlobalDisaster[]>>();

/**
 * Validates longitude and latitude bounds in WGS84
 */
function isValidWgs84(lon: number, lat: number): boolean {
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

type EonetGeometryInput =
  | EonetRawGeometryItem[]
  | EonetRawGeometryItem
  | {
      type?: string;
      coordinates?: unknown;
      date?: string;
      magnitudeValue?: number | null;
      magnitudeUnit?: string | null;
    }
  | null
  | undefined;

/**
 * Extracts centroid coordinates [longitude, latitude] and geometry type from various GeoJSON geometries or EONET structures
 */
export function extractCentroidAndType(rawGeometry: EonetGeometryInput): {
  coordinates: [number, number];
  geometryType: "Point" | "Polygon" | "LineString";
  date?: string;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
} | null {
  if (!rawGeometry) return null;

  // Case A: EONET raw event geometry array (e.g. [{ date, type, coordinates, magnitudeValue }])
  if (Array.isArray(rawGeometry)) {
    if (rawGeometry.length === 0) return null;
    // Pick the most recent geometry snapshot (usually the last in the chronological array)
    const latestItem = rawGeometry[rawGeometry.length - 1];
    if (!latestItem || !latestItem.coordinates) return null;

    const parsed = extractCentroidAndType(latestItem);
    if (!parsed) return null;
    return {
      ...parsed,
      date: latestItem.date,
      magnitudeValue: latestItem.magnitudeValue,
      magnitudeUnit: latestItem.magnitudeUnit,
    };
  }

  const geomObj = rawGeometry as Record<string, unknown>;
  const geomType = geomObj.type as string | undefined;
  const coords = geomObj.coordinates;
  const dateStr = typeof geomObj.date === "string" ? geomObj.date : undefined;
  const magVal = typeof geomObj.magnitudeValue === "number" ? geomObj.magnitudeValue : null;
  const magUnit = typeof geomObj.magnitudeUnit === "string" ? geomObj.magnitudeUnit : null;

  if (!coords) return null;

  // 1. Point: [lon, lat]
  if (Array.isArray(coords) && (geomType === "Point" || !geomType) && coords.length >= 2 && typeof coords[0] === "number") {
    const lon = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!isValidWgs84(lon, lat)) return null;
    return {
      coordinates: [lon, lat],
      geometryType: "Point",
      date: dateStr,
      magnitudeValue: magVal,
      magnitudeUnit: magUnit,
    };
  }

  // 2. LineString: [[lon, lat], [lon, lat], ...]
  if (geomType === "LineString" && Array.isArray(coords) && coords.length > 0) {
    let sumLon = 0;
    let sumLat = 0;
    let count = 0;

    for (const pt of coords) {
      if (Array.isArray(pt) && pt.length >= 2) {
        const lon = Number(pt[0]);
        const lat = Number(pt[1]);
        if (isValidWgs84(lon, lat)) {
          sumLon += lon;
          sumLat += lat;
          count++;
        }
      }
    }

    if (count === 0) return null;
    return {
      coordinates: [sumLon / count, sumLat / count],
      geometryType: "LineString",
      date: dateStr,
      magnitudeValue: magVal,
      magnitudeUnit: magUnit,
    };
  }

  // 3. Polygon: [[[lon, lat], ...]]
  if (geomType === "Polygon" && Array.isArray(coords) && coords.length > 0) {
    const ring = Array.isArray(coords[0]) ? coords[0] : coords;
    let sumLon = 0;
    let sumLat = 0;
    let count = 0;

    for (const pt of ring) {
      if (Array.isArray(pt) && pt.length >= 2) {
        const lon = Number(pt[0]);
        const lat = Number(pt[1]);
        if (isValidWgs84(lon, lat)) {
          sumLon += lon;
          sumLat += lat;
          count++;
        }
      }
    }

    if (count === 0) return null;
    return {
      coordinates: [sumLon / count, sumLat / count],
      geometryType: "Polygon",
      date: dateStr,
      magnitudeValue: magVal,
      magnitudeUnit: magUnit,
    };
  }

  return null;
}

/**
 * Normalizes an individual NASA EONET event into a canonical NormalizedGlobalDisaster
 */
export function normalizeEonetEvent(
  raw: EonetGeoJsonFeature | EonetRawEvent,
  userLat?: number,
  userLon?: number
): NormalizedGlobalDisaster | null {
  if (!raw) return null;

  // Determine if raw object is a GeoJSON Feature or direct EONET Event
  const isGeoJsonFeature = "type" in raw && raw.type === "Feature" && "properties" in raw;
  const props = isGeoJsonFeature ? (raw as EonetGeoJsonFeature).properties : (raw as EonetRawEvent);
  const rawGeom = isGeoJsonFeature ? (raw as EonetGeoJsonFeature).geometry : (raw as EonetRawEvent).geometry;

  if (!props) return null;

  const eventId = String(props.id || raw.id || "").trim();
  if (!eventId) return null;

  // Extract centroid & geometry details
  const centroidInfo = extractCentroidAndType(rawGeom);
  if (!centroidInfo) return null;

  const [lon, lat] = centroidInfo.coordinates;

  // Extract category
  const rawCategories = props.categories || [];
  const primaryCategory = rawCategories[0] || { id: "other", title: "Natural Event" };
  const eventTitle = props.title || "Unnamed Environmental Event";

  const { disasterType, categoryKey, categoryTitle } = mapEonetCategoryToCanonicalType(
    primaryCategory.id,
    eventTitle
  );

  // Extract sources
  const rawSources = props.sources || [];
  const sources = rawSources.map((s) => ({
    id: s.id || "Source",
    url: s.url || EONET_CONFIG.sourceUrl,
  }));
  const primarySource: { id: string; url: string } = sources[0] || {
    id: EONET_CONFIG.sourceName,
    url: props.link || EONET_CONFIG.sourceUrl,
  };

  // Magnitude values
  const propMagValue = "magnitudeValue" in props ? props.magnitudeValue : undefined;
  const propMagUnit = "magnitudeUnit" in props ? props.magnitudeUnit : undefined;
  const propDate = "date" in props ? props.date : undefined;

  const magnitudeValue =
    propMagValue !== undefined ? propMagValue : centroidInfo.magnitudeValue;
  const magnitudeUnit = propMagUnit || centroidInfo.magnitudeUnit;

  // Calculate severity
  const severity = calculateEonetSeverity(
    categoryKey,
    eventTitle,
    magnitudeValue,
    magnitudeUnit
  );

  // Calculate Haversine distance relative to user coordinates if provided
  let distanceKm: number | undefined;
  if (typeof userLat === "number" && typeof userLon === "number" && isValidWgs84(userLon, userLat)) {
    distanceKm = Math.round(calculateHaversineDistanceKm([userLon, userLat], [lon, lat]));
  }

  // Timestamps
  const occurredAt = centroidInfo.date || propDate || new Date().toISOString();
  const updatedAt = propDate || centroidInfo.date || occurredAt;
  const isOpen = !props.closed;

  return {
    id: `eonet-${eventId}`,
    provider: "nasa-eonet",
    providerEventId: eventId,
    disasterType,
    categoryKey,
    categoryTitle,
    title: eventTitle,
    description: props.description || undefined,
    geometryType: centroidInfo.geometryType,
    latitude: lat,
    longitude: lon,
    coordinates: [lon, lat],
    occurredAt,
    updatedAt,
    closedAt: props.closed || null,
    isOpen,
    sources,
    primarySource: {
      name: primarySource.id || "NASA EONET",
      url: primarySource.url,
    },
    sourceUrl: props.link || `https://eonet.gsfc.nasa.gov/api/v3/events/${eventId}`,
    magnitudeValue: magnitudeValue ?? null,
    magnitudeUnit: magnitudeUnit ?? null,
    severity,
    severityScale: "ResQEarth / EONET classification",
    distanceKm,
    isStale: false,
  };
}

/**
 * Normalizes an entire EONET feed response (GeoJSON FeatureCollection or Events JSON)
 */
export function normalizeEonetFeed(
  feed: EonetGeoJsonResponse | EonetEventsResponse,
  userLat?: number,
  userLon?: number
): NormalizedGlobalDisaster[] {
  if (!feed) return [];

  const rawList =
    "features" in feed && feed.features ? feed.features : feed.events || [];
  const normalizedList: NormalizedGlobalDisaster[] = [];

  for (const item of rawList) {
    const normalized = normalizeEonetEvent(item as EonetGeoJsonFeature | EonetRawEvent, userLat, userLon);
    if (normalized) {
      normalizedList.push(normalized);
    }
  }

  // Sort chronologically: newest updatedAt / occurredAt first
  return normalizedList.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.occurredAt).getTime();
    const timeB = new Date(b.updatedAt || b.occurredAt).getTime();
    return timeB - timeA;
  });
}

/**
 * Converts normalized global disaster events into a MapLibre GeoJSON FeatureCollection
 */
export function globalDisastersToGeoJson(
  disasters: NormalizedGlobalDisaster[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GlobalDisasterGeoJsonFeature[] = disasters.map((d) => ({
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
      markerRadius: getGlobalDisasterMarkerRadius(d.severity),
      distanceKm: d.distanceKm,
      isOpen: d.isOpen,
      occurredAt: d.occurredAt,
      source: d.primarySource.name,
      sourceUrl: d.sourceUrl,
      category: "global-disaster",
    },
  }));

  return {
    type: "FeatureCollection",
    features: features as unknown as GeoJSON.Feature<GeoJSON.Point>[],
  };
}

/**
 * Fetches live global disaster events from NASA EONET v3 with caching, deduplication, and fallback
 */
export async function fetchGlobalDisasters(
  options?: GlobalDisasterFetchOptions
): Promise<NormalizedGlobalDisaster[]> {
  const days = options?.days ?? EONET_CONFIG.defaultDays;
  const status = options?.status ?? EONET_CONFIG.defaultStatus;
  const category = options?.category && options.category !== "all" ? options.category : undefined;

  const cacheKey = `eonet-${status}-${days}-${category || "all"}`;

  // 1. Check in-memory cache if not force refreshing
  if (!options?.forceRefresh) {
    const cached = globalDisasterCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < EONET_CONFIG.cacheTtlMs) {
      // Re-calculate distances relative to current user coordinates
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
  const existingPromise = inFlightRequests.get(cacheKey);
  if (existingPromise && !options?.forceRefresh) {
    return existingPromise;
  }

  // 3. Initiate fetch request
  const requestPromise = (async (): Promise<NormalizedGlobalDisaster[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, EONET_CONFIG.timeoutMs);

    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const url = new URL(EONET_CONFIG.eventsGeoJsonUrl);
      url.searchParams.set("status", status);
      url.searchParams.set("days", String(days));
      if (category) {
        url.searchParams.set("category", category);
      }

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`NASA EONET API returned status ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();
      const normalized = normalizeEonetFeed(rawData, options?.userLat, options?.userLon);

      // Cache successful response
      globalDisasterCache.set(cacheKey, {
        data: normalized,
        timestamp: Date.now(),
      });

      return normalized;
    } catch (err: unknown) {
      // Return stale cache if available on network failure
      const cached = globalDisasterCache.get(cacheKey);
      if (cached && cached.data.length > 0) {
        return cached.data.map((item) => ({ ...item, isStale: true }));
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Clears all cached global disaster feeds
 */
export function clearGlobalDisasterCache(): void {
  globalDisasterCache.clear();
  inFlightRequests.clear();
}
