import type {
  NormalizedWeather,
  OpenMeteoResponse,
  HourlyWeatherPoint,
  DailyWeatherSummary,
  WeatherFetchOptions,
} from "../types/weather";
import {
  OPEN_METEO_CONFIG,
  getWmoWeatherInterpretation,
} from "../constants";

// In-memory cache for weather data
const weatherCache = new Map<
  string,
  { weather: NormalizedWeather; timestamp: number }
>();

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<NormalizedWeather>>();

/**
 * Generates a consistent cache key from geographic coordinates
 */
export function generateWeatherCacheKey(latitude: number, longitude: number): string {
  const p = OPEN_METEO_CONFIG.coordinatePrecision;
  return `${latitude.toFixed(p)},${longitude.toFixed(p)}`;
}

/**
 * Normalizes an Open-Meteo API response into the application's canonical NormalizedWeather model
 */
export function normalizeOpenMeteoResponse(
  data: OpenMeteoResponse,
  fallbackLat: number,
  fallbackLon: number,
  locationName: string = "Current Location"
): NormalizedWeather {
  if (!data || data.error) {
    throw new Error(data?.reason || "Invalid Open-Meteo weather response received");
  }

  const current = data.current || {
    time: new Date().toISOString(),
    temperature_2m: 25,
  };

  const weatherCode = current.weather_code ?? 0;
  const interpretation = getWmoWeatherInterpretation(weatherCode);

  const temperature = typeof current.temperature_2m === "number" ? current.temperature_2m : 25;
  const apparentTemperature =
    typeof current.apparent_temperature === "number"
      ? current.apparent_temperature
      : temperature;
  const humidity =
    typeof current.relative_humidity_2m === "number"
      ? current.relative_humidity_2m
      : 50;
  const precipitation =
    typeof current.precipitation === "number" ? current.precipitation : 0;
  const rain = typeof current.rain === "number" ? current.rain : precipitation;
  const windSpeed =
    typeof current.wind_speed_10m === "number" ? current.wind_speed_10m : 0;
  const windGusts =
    typeof current.wind_gusts_10m === "number" ? current.wind_gusts_10m : windSpeed;
  const isDay = current.is_day === 0 ? false : true;

  // Process hourly forecasts
  const hourlyForecast: HourlyWeatherPoint[] = [];
  let currentPrecipitationProbability = 0;

  if (data.hourly && Array.isArray(data.hourly.time)) {
    const times = data.hourly.time;
    const nowIso = new Date().toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
    let startIndex = times.findIndex((t) => t.startsWith(nowIso));
    if (startIndex === -1) startIndex = 0;

    // Get current precipitation probability from closest hourly slot
    if (
      data.hourly.precipitation_probability &&
      typeof data.hourly.precipitation_probability[startIndex] === "number"
    ) {
      currentPrecipitationProbability =
        data.hourly.precipitation_probability[startIndex];
    }

    // Extract next 24 hours of forecast
    const endIndex = Math.min(times.length, startIndex + 24);
    for (let i = startIndex; i < endIndex; i++) {
      hourlyForecast.push({
        time: times[i],
        temperature: data.hourly.temperature_2m?.[i] ?? temperature,
        apparentTemperature: data.hourly.apparent_temperature?.[i],
        precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
        precipitation: data.hourly.precipitation?.[i] ?? 0,
        weatherCode: data.hourly.weather_code?.[i] ?? weatherCode,
        windSpeed: data.hourly.wind_speed_10m?.[i] ?? windSpeed,
      });
    }
  }

  // Process daily forecasts if present
  let dailyForecast: DailyWeatherSummary[] | undefined;
  if (data.daily && Array.isArray(data.daily.time)) {
    dailyForecast = data.daily.time.slice(0, 7).map((date, idx) => ({
      date,
      temperatureMax: data.daily?.temperature_2m_max?.[idx] ?? temperature,
      temperatureMin: data.daily?.temperature_2m_min?.[idx] ?? temperature,
      precipitationSum: data.daily?.precipitation_sum?.[idx] ?? 0,
      precipitationProbabilityMax: data.daily?.precipitation_probability_max?.[idx],
      weatherCode: data.daily?.weather_code?.[idx] ?? weatherCode,
    }));
  }

  return {
    temperature,
    apparentTemperature,
    humidity,
    precipitation,
    precipitationProbability: currentPrecipitationProbability,
    rain,
    windSpeed,
    windGusts,
    weatherCode,
    conditionLabel: interpretation.label,
    conditionDescription: interpretation.description,
    isDay,
    locationName,
    latitude: typeof data.latitude === "number" ? data.latitude : fallbackLat,
    longitude: typeof data.longitude === "number" ? data.longitude : fallbackLon,
    updatedAt: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
    source: OPEN_METEO_CONFIG.sourceName,
    sourceUrl: OPEN_METEO_CONFIG.sourceUrl,
    isStale: false,
    hourlyForecast,
    dailyForecast,
  };
}

/**
 * Fetches live weather from Open-Meteo with caching, deduplication, and stale fallback
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  options?: WeatherFetchOptions
): Promise<NormalizedWeather> {
  const cacheKey = generateWeatherCacheKey(latitude, longitude);
  const locationName = options?.locationName || "Current Location";

  // 1. Check in-memory cache if not force refreshing
  if (!options?.forceRefresh) {
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < OPEN_METEO_CONFIG.cacheTtlMs) {
      return {
        ...cached.weather,
        locationName, // update display name if user changed label
      };
    }
  }

  // 2. Check in-flight request deduplication
  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest && !options?.forceRefresh) {
    return existingRequest;
  }

  // 3. Initiate fetch promise
  const requestPromise = (async (): Promise<NormalizedWeather> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, OPEN_METEO_CONFIG.timeoutMs);

    // Forward abort signal if passed
    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }

    try {
      const url = `${OPEN_METEO_CONFIG.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,is_day&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,rain,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}: ${response.statusText}`);
      }

      const json: OpenMeteoResponse = await response.json();

      if (json.error) {
        throw new Error(json.reason || "Open-Meteo returned an error payload");
      }

      const normalized = normalizeOpenMeteoResponse(
        json,
        latitude,
        longitude,
        locationName
      );

      // Save to cache
      weatherCache.set(cacheKey, {
        weather: normalized,
        timestamp: Date.now(),
      });

      return normalized;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // Check if stale cache is available as fallback
      const cached = weatherCache.get(cacheKey);
      if (cached) {
        return {
          ...cached.weather,
          locationName,
          isStale: true,
        };
      }

      const isAbort =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("aborted"));
      const message = isAbort
        ? "Weather request timed out. Please check your connection."
        : err instanceof Error
        ? err.message
        : "Failed to load meteorological data.";

      throw new Error(message);
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Clears the weather cache (useful for testing or manual reset)
 */
export function clearWeatherCache(): void {
  weatherCache.clear();
  inFlightRequests.clear();
}
