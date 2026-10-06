export const OPEN_METEO_CONFIG = {
  baseUrl: "https://api.open-meteo.com/v1/forecast",
  timeoutMs: 25000,
  cacheTtlMs: 10 * 60 * 1000, // 10 minutes cache TTL
  coordinatePrecision: 2, // ~1km precision for cache keys (avoids excessive API calls on micro GPS drift)
  sourceName: "Open-Meteo Weather API",
  sourceUrl: "https://open-meteo.com",
} as const;

export const DEFAULT_WEATHER_FALLBACK = {
  temperature: 28,
  apparentTemperature: 31,
  humidity: 75,
  precipitation: 0,
  precipitationProbability: 10,
  rain: 0,
  windSpeed: 12,
  windGusts: 18,
  weatherCode: 1, // Mainly Clear
  conditionLabel: "Mainly Clear",
  conditionDescription: "Typical coastal ambient weather.",
  isDay: true,
  locationName: "Mumbai, Maharashtra, India",
  latitude: 19.076,
  longitude: 72.8777,
  source: "Open-Meteo Weather API",
  sourceUrl: "https://open-meteo.com",
  isStale: false,
  hourlyForecast: [],
} as const;
