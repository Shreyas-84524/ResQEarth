export interface HourlyWeatherPoint {
  time: string;
  temperature: number;
  apparentTemperature?: number;
  precipitationProbability?: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyWeatherSummary {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax?: number;
  weatherCode: number;
}

export interface NormalizedWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  rain: number;
  windSpeed: number;
  windGusts: number;
  weatherCode: number;
  conditionLabel: string;
  conditionDescription: string;
  isDay: boolean;
  locationName: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  source: string;
  sourceUrl: string;
  isStale: boolean;
  hourlyForecast: HourlyWeatherPoint[];
  dailyForecast?: DailyWeatherSummary[];
}

export interface OpenMeteoCurrentData {
  time: string;
  interval?: number;
  temperature_2m: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  precipitation?: number;
  rain?: number;
  weather_code?: number;
  wind_speed_10m?: number;
  wind_gusts_10m?: number;
  is_day?: number;
}

export interface OpenMeteoHourlyData {
  time: string[];
  temperature_2m?: number[];
  apparent_temperature?: number[];
  relative_humidity_2m?: number[];
  precipitation?: number[];
  precipitation_probability?: number[];
  rain?: number[];
  weather_code?: number[];
  wind_speed_10m?: number[];
  wind_gusts_10m?: number[];
}

export interface OpenMeteoDailyData {
  time: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  precipitation_probability_max?: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current_units?: Record<string, string>;
  current?: OpenMeteoCurrentData;
  hourly_units?: Record<string, string>;
  hourly?: OpenMeteoHourlyData;
  daily_units?: Record<string, string>;
  daily?: OpenMeteoDailyData;
  error?: boolean;
  reason?: string;
}

export interface WeatherFetchOptions {
  locationName?: string;
  forceRefresh?: boolean;
  signal?: AbortSignal;
}
