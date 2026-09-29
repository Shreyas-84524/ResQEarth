import type {
  NormalizedEarthquake,
  UsgsEarthquakeFeature,
  UsgsEarthquakeFeedResponse,
  EarthquakeFeedTimeWindow,
  EarthquakeFetchOptions,
} from "../types/earthquake";
import {
  USGS_FEED_URLS,
  EARTHQUAKE_CONFIG,
  calculateEarthquakeSeverity,
  getEarthquakeMarkerRadius,
} from "../constants/earthquake-config";
import { calculateHaversineDistanceKm } from "@/features/map/services/geojson-helper";

// In-memory cache for earthquake feeds
const earthquakeCache = new Map<
  EarthquakeFeedTimeWindow,
  { data: NormalizedEarthquake[]; timestamp: number }
>();

// In-flight request deduplication map
const inFlightRequests = new Map<
  EarthquakeFeedTimeWindow,
  Promise<NormalizedEarthquake[]>
>();

/**
 * Normalizes an individual USGS GeoJSON feature into a canonical NormalizedEarthquake
 */
export function normalizeUsgsFeature(
  feature: UsgsEarthquakeFeature,
  userLat?: number,
  userLon?: number
): NormalizedEarthquake | null {
  if (
    !feature ||
    !feature.geometry ||
    !Array.isArray(feature.geometry.coordinates) ||
    feature.geometry.coordinates.length < 2
  ) {
    return null;
  }

  const [lon, lat, rawDepth] = feature.geometry.coordinates;

  // Validate coordinate ranges
  if (
    typeof lon !== "number" ||
    typeof lat !== "number" ||
    isNaN(lon) ||
    isNaN(lat) ||
    lon < -180 ||
    lon > 180 ||
    lat < -90 ||
    lat > 90
  ) {
    return null;
  }

  const props = feature.properties || ({} as UsgsEarthquakeFeature["properties"]);
  const rawMag = typeof props.mag === "number" && !isNaN(props.mag) ? props.mag : 0;
  const magnitude = Math.round(rawMag * 10) / 10;
  const depthKm =
    typeof rawDepth === "number" && !isNaN(rawDepth)
      ? Math.round(rawDepth * 10) / 10
      : 10;

  const place = (props.place && props.place.trim()) || "Location unspecified";
  const title =
    (props.title && props.title.trim()) ||
    `M ${magnitude.toFixed(1)} - ${place}`;

  const occurredAt = props.time
    ? new Date(props.time).toISOString()
    : new Date().toISOString();
  const updatedAt = props.updated
    ? new Date(props.updated).toISOString()
    : occurredAt;

  const tsunamiAlert = props.tsunami === 1;
  const severity = calculateEarthquakeSeverity(magnitude);

  let distanceKm: number | undefined;
  if (
    typeof userLat === "number" &&
    typeof userLon === "number" &&
    !isNaN(userLat) &&
    !isNaN(userLon)
  ) {
    distanceKm = Math.round(
      calculateHaversineDistanceKm([userLon, userLat], [lon, lat])
    );
  }

  return {
    id: `usgs-${feature.id || Math.random().toString(36).slice(2, 9)}`,
    provider: "usgs",
    providerEventId: feature.id || "",
    disasterType: "earthquake",
    title,
    place,
    magnitude,
    depthKm,
    latitude: lat,
    longitude: lon,
    occurredAt,
    updatedAt,
    tsunamiAlert,
    feltReports: props.felt ?? undefined,
    significance: props.sig ?? undefined,
    status:
      props.status === "reviewed"
        ? "reviewed"
        : props.status === "automatic"
        ? "automatic"
        : "unknown",
    magType: props.magType || "mw",
    source: EARTHQUAKE_CONFIG.sourceName,
    sourceUrl: props.url || `${EARTHQUAKE_CONFIG.sourceUrl}/earthquakes/eventpage/${feature.id}`,
    detailUrl: props.detail,
    severity,
    severityScale: "Moment Magnitude Scale (Mw)",
    distanceKm,
    isStale: false,
  };
}

/**
 * Normalizes an entire USGS Earthquake GeoJSON Feed
 */
export function normalizeUsgsFeed(
  feed: UsgsEarthquakeFeedResponse,
  userLat?: number,
  userLon?: number
): NormalizedEarthquake[] {
  if (!feed || !Array.isArray(feed.features)) {
    return [];
  }

  const normalizedList: NormalizedEarthquake[] = [];

  for (const feature of feed.features) {
    const item = normalizeUsgsFeature(feature, userLat, userLon);
    if (item) {
      normalizedList.push(item);
    }
  }

  // Sort by occurrence timestamp descending (newest first)
  return normalizedList.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

/**
 * Converts NormalizedEarthquake list into a MapLibre-ready GeoJSON FeatureCollection
 */
export function earthquakesToGeoJson(
  earthquakes: NormalizedEarthquake[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: earthquakes.map((eq) => ({
      type: "Feature",
      id: eq.id,
      geometry: {
        type: "Point",
        coordinates: [eq.longitude, eq.latitude],
      },
      properties: {
        id: eq.id,
        title: eq.title,
        place: eq.place,
        magnitude: eq.magnitude,
        depthKm: eq.depthKm,
        occurredAt: eq.occurredAt,
        severity: eq.severity,
        tsunamiAlert: eq.tsunamiAlert,
        distanceKm: eq.distanceKm,
        sourceUrl: eq.sourceUrl,
        markerRadius: getEarthquakeMarkerRadius(eq.magnitude),
        category: "earthquake",
      },
    })),
  };
}

/**
 * Fetches live earthquake events from USGS feed with caching, deduplication, and fallback
 */
export async function fetchEarthquakes(
  feedType: EarthquakeFeedTimeWindow = EARTHQUAKE_CONFIG.defaultFeed,
  options?: EarthquakeFetchOptions
): Promise<NormalizedEarthquake[]> {
  const url = USGS_FEED_URLS[feedType] || USGS_FEED_URLS["day_2.5"];

  // 1. Check in-memory cache if not force refreshing
  if (!options?.forceRefresh) {
    const cached = earthquakeCache.get(feedType);
    if (cached && Date.now() - cached.timestamp < EARTHQUAKE_CONFIG.cacheTtlMs) {
      // Re-calculate distance relative to current user coordinates
      return cached.data.map((eq) => {
        let dist = eq.distanceKm;
        if (
          typeof options?.userLat === "number" &&
          typeof options?.userLon === "number"
        ) {
          dist = Math.round(
            calculateHaversineDistanceKm(
              [options.userLon, options.userLat],
              [eq.longitude, eq.latitude]
            )
          );
        }
        return { ...eq, distanceKm: dist };
      });
    }
  }

  // 2. In-flight request deduplication
  const existingPromise = inFlightRequests.get(feedType);
  if (existingPromise && !options?.forceRefresh) {
    return existingPromise;
  }

  // 3. Initiate fetch promise
  const requestPromise = (async (): Promise<NormalizedEarthquake[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, EARTHQUAKE_CONFIG.timeoutMs);

    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`USGS HTTP ${response.status}: ${response.statusText}`);
      }

      const json: UsgsEarthquakeFeedResponse = await response.json();
      const normalized = normalizeUsgsFeed(
        json,
        options?.userLat,
        options?.userLon
      );

      // Save to cache
      earthquakeCache.set(feedType, {
        data: normalized,
        timestamp: Date.now(),
      });

      return normalized;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // Stale cache fallback
      const cached = earthquakeCache.get(feedType);
      if (cached) {
        return cached.data.map((eq) => ({ ...eq, isStale: true }));
      }

      const isAbort =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("aborted"));
      const message = isAbort
        ? "USGS Earthquake service timed out. Please check your network connection."
        : err instanceof Error
        ? err.message
        : "Failed to load seismic monitoring feed.";

      throw new Error(message);
    } finally {
      inFlightRequests.delete(feedType);
    }
  })();

  inFlightRequests.set(feedType, requestPromise);
  return requestPromise;
}

/**
 * Clears earthquake cache (used for tests or manual refresh)
 */
export function clearEarthquakeCache(): void {
  earthquakeCache.clear();
  inFlightRequests.clear();
}
