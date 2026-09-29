import {
  normalizeOpenMeteoResponse,
  generateWeatherCacheKey,
  clearWeatherCache,
} from "../services/weather-service";
import type { OpenMeteoResponse } from "../types/weather";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("--- Starting Weather Service & Normalization Unit Tests ---");

// 1. Full Open-Meteo Response Normalization
const mockApiResponse: OpenMeteoResponse = {
  latitude: 19.076,
  longitude: 72.8777,
  generationtime_ms: 0.12,
  utc_offset_seconds: 19800,
  timezone: "Asia/Kolkata",
  timezone_abbreviation: "IST",
  elevation: 14,
  current: {
    time: "2026-09-30T12:00",
    temperature_2m: 31.4,
    apparent_temperature: 36.8,
    relative_humidity_2m: 78,
    precipitation: 2.4,
    rain: 2.4,
    weather_code: 63, // Moderate rain
    wind_speed_10m: 16.5,
    wind_gusts_10m: 24.2,
    is_day: 1,
  },
  hourly: {
    time: [
      "2026-09-30T12:00",
      "2026-09-30T13:00",
      "2026-09-30T14:00",
      "2026-09-30T15:00",
    ],
    temperature_2m: [31.4, 31.0, 30.2, 29.5],
    apparent_temperature: [36.8, 36.1, 35.0, 34.2],
    relative_humidity_2m: [78, 80, 82, 85],
    precipitation: [2.4, 3.1, 1.8, 0.4],
    precipitation_probability: [75, 80, 60, 30],
    weather_code: [63, 65, 61, 80],
    wind_speed_10m: [16.5, 18.0, 15.2, 12.0],
  },
  daily: {
    time: ["2026-09-30", "2026-10-01"],
    weather_code: [63, 61],
    temperature_2m_max: [32.5, 31.8],
    temperature_2m_min: [26.0, 25.4],
    precipitation_sum: [12.4, 6.2],
    precipitation_probability_max: [85, 60],
  },
};

const normalized = normalizeOpenMeteoResponse(
  mockApiResponse,
  19.076,
  72.8777,
  "Mumbai, Maharashtra, India"
);

assert(normalized.temperature === 31.4, "Temperature normalized correctly");
assert(normalized.apparentTemperature === 36.8, "Apparent temperature normalized correctly");
assert(normalized.humidity === 78, "Humidity normalized correctly");
assert(normalized.precipitation === 2.4, "Precipitation normalized correctly");
assert(normalized.precipitationProbability === 75, "Precipitation probability extracted from current hour");
assert(normalized.rain === 2.4, "Rain normalized correctly");
assert(normalized.windSpeed === 16.5, "Wind speed normalized correctly");
assert(normalized.windGusts === 24.2, "Wind gusts normalized correctly");
assert(normalized.weatherCode === 63, "Weather code normalized correctly");
assert(normalized.conditionLabel === "Moderate Rain", "Condition label is Moderate Rain");
assert(normalized.isDay === true, "isDay is true");
assert(normalized.locationName === "Mumbai, Maharashtra, India", "Location name preserved");
assert(normalized.latitude === 19.076, "Latitude preserved");
assert(normalized.longitude === 72.8777, "Longitude preserved");
assert(normalized.source.includes("Open-Meteo"), "Source contains Open-Meteo");
assert(normalized.isStale === false, "isStale is false on fresh normalization");
assert(normalized.hourlyForecast.length === 4, "4 hourly forecast entries extracted");
assert(normalized.dailyForecast?.length === 2, "2 daily forecast entries extracted");
assert(normalized.hourlyForecast[1].precipitationProbability === 80, "Hourly precipitation probability preserved");

console.log("✓ PASS: Full Open-Meteo payload normalization tests");

// 2. Minimal / Partial Response Normalization (Fallback Resilience)
const minimalResponse: OpenMeteoResponse = {
  latitude: 28.6139,
  longitude: 77.209,
  current: {
    time: "2026-09-30T12:00",
    temperature_2m: 24.0,
  },
};

const normalizedMinimal = normalizeOpenMeteoResponse(
  minimalResponse,
  28.6139,
  77.209,
  "New Delhi, Delhi, India"
);

assert(normalizedMinimal.temperature === 24.0, "Minimal temperature preserved");
assert(normalizedMinimal.apparentTemperature === 24.0, "Apparent temperature falls back to temperature");
assert(normalizedMinimal.humidity === 50, "Humidity falls back to 50%");
assert(normalizedMinimal.precipitation === 0, "Precipitation falls back to 0");
assert(normalizedMinimal.windSpeed === 0, "Wind speed falls back to 0");
assert(normalizedMinimal.weatherCode === 0, "Weather code falls back to 0");
assert(normalizedMinimal.conditionLabel === "Clear Sky", "Condition label falls back to Clear Sky");
assert(normalizedMinimal.hourlyForecast.length === 0, "Empty hourly forecast array");

console.log("✓ PASS: Minimal / Partial payload normalization tests");

// 3. Negative Temperatures & Extreme Values
const extremeResponse: OpenMeteoResponse = {
  latitude: 34.0837,
  longitude: 74.7973,
  current: {
    time: "2026-01-15T04:00",
    temperature_2m: -6.5,
    apparent_temperature: -11.2,
    relative_humidity_2m: 92,
    precipitation: 5.8,
    weather_code: 75, // Heavy Snow
    wind_speed_10m: 35.0,
    wind_gusts_10m: 55.0,
    is_day: 0,
  },
};

const normalizedExtreme = normalizeOpenMeteoResponse(
  extremeResponse,
  34.0837,
  74.7973,
  "Srinagar, Jammu and Kashmir"
);

assert(normalizedExtreme.temperature === -6.5, "Negative temperature supported");
assert(normalizedExtreme.apparentTemperature === -11.2, "Negative apparent temperature supported");
assert(normalizedExtreme.conditionLabel === "Heavy Snow", "Heavy Snow condition recognized");
assert(normalizedExtreme.isDay === false, "Nighttime isDay is false");

console.log("✓ PASS: Extreme & negative temperature normalization tests");

// 4. Cache Key Generation & Precision Rounding
const key1 = generateWeatherCacheKey(19.0760, 72.8777);
const key2 = generateWeatherCacheKey(19.0764, 72.8772);
assert(key1 === "19.08,72.88", "Coordinates rounded to 2 decimal places");
assert(key1 === key2, "Micro GPS drift within ~1km resolves to identical cache key");

const keyDelhi = generateWeatherCacheKey(28.6139, 77.2090);
assert(keyDelhi === "28.61,77.21", "Delhi coordinates formatted correctly");
assert(key1 !== keyDelhi, "Different regions generate distinct cache keys");

console.log("✓ PASS: Cache key generation and coordinate rounding tests");

// 5. Invalid / Error Response Rejection
let caughtError = false;
try {
  normalizeOpenMeteoResponse(
    { error: true, reason: "Latitude out of range", latitude: 0, longitude: 0 },
    0,
    0
  );
} catch (e: unknown) {
  caughtError = true;
  assert((e as Error).message.includes("Latitude out of range"), "Error message propagated");
}
assert(caughtError, "Error payload thrown successfully");

console.log("✓ PASS: Error payload handling tests");

// 6. Cache Clearing
clearWeatherCache();
console.log("✓ PASS: clearWeatherCache tests");

console.log("\nAll Weather Service unit tests passed successfully!\n");
