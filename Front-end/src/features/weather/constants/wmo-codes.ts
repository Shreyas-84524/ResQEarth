import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";

export type WeatherSeverityLevel = "low" | "moderate" | "high" | "critical";

export interface WmoWeatherInterpretation {
  code: number;
  label: string;
  description: string;
  severity: WeatherSeverityLevel;
  icon: LucideIcon;
  iconCategory: "clear" | "partly-cloudy" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunderstorm";
}

export const WMO_WEATHER_CODES: Record<number, WmoWeatherInterpretation> = {
  0: {
    code: 0,
    label: "Clear Sky",
    description: "Cloudless skies with optimal atmospheric visibility.",
    severity: "low",
    icon: Sun,
    iconCategory: "clear",
  },
  1: {
    code: 1,
    label: "Mainly Clear",
    description: "Predominantly clear with scattered faint clouds.",
    severity: "low",
    icon: CloudSun,
    iconCategory: "partly-cloudy",
  },
  2: {
    code: 2,
    label: "Partly Cloudy",
    description: "Mix of sun and clouds throughout the area.",
    severity: "low",
    icon: CloudSun,
    iconCategory: "partly-cloudy",
  },
  3: {
    code: 3,
    label: "Overcast",
    description: "Full cloud cover blocking direct sunlight.",
    severity: "low",
    icon: Cloud,
    iconCategory: "cloudy",
  },
  45: {
    code: 45,
    label: "Fog",
    description: "Ground-level dense mist reducing horizontal visibility.",
    severity: "moderate",
    icon: CloudFog,
    iconCategory: "fog",
  },
  48: {
    code: 48,
    label: "Depositing Rime Fog",
    description: "Icy fog forming frost crystals on cold surfaces.",
    severity: "moderate",
    icon: CloudFog,
    iconCategory: "fog",
  },
  51: {
    code: 51,
    label: "Light Drizzle",
    description: "Continuous or intermittent light misty precipitation.",
    severity: "low",
    icon: CloudDrizzle,
    iconCategory: "drizzle",
  },
  53: {
    code: 53,
    label: "Moderate Drizzle",
    description: "Steady drizzle with moderate surface moisture buildup.",
    severity: "low",
    icon: CloudDrizzle,
    iconCategory: "drizzle",
  },
  55: {
    code: 55,
    label: "Dense Drizzle",
    description: "Heavy mist and precipitation causing wet road surfaces.",
    severity: "moderate",
    icon: CloudDrizzle,
    iconCategory: "drizzle",
  },
  56: {
    code: 56,
    label: "Light Freezing Drizzle",
    description: "Freezing mist creating thin ice patches on exposure.",
    severity: "moderate",
    icon: CloudDrizzle,
    iconCategory: "drizzle",
  },
  57: {
    code: 57,
    label: "Dense Freezing Drizzle",
    description: "Hazardous freezing drizzle creating glaze ice on roads.",
    severity: "high",
    icon: CloudDrizzle,
    iconCategory: "drizzle",
  },
  61: {
    code: 61,
    label: "Slight Rain",
    description: "Gentle rain showers with minimal runoff hazard.",
    severity: "low",
    icon: CloudRain,
    iconCategory: "rain",
  },
  63: {
    code: 63,
    label: "Moderate Rain",
    description: "Steady rainfall with localized water accumulation.",
    severity: "moderate",
    icon: CloudRain,
    iconCategory: "rain",
  },
  65: {
    code: 65,
    label: "Heavy Rain",
    description: "Intense downpours with elevated urban waterlogging risk.",
    severity: "high",
    icon: CloudRain,
    iconCategory: "rain",
  },
  66: {
    code: 66,
    label: "Light Freezing Rain",
    description: "Freezing rain creating hazardous surface slickness.",
    severity: "moderate",
    icon: CloudRain,
    iconCategory: "rain",
  },
  67: {
    code: 67,
    label: "Heavy Freezing Rain",
    description: "Severe ice accumulation on infrastructure and transit lines.",
    severity: "critical",
    icon: CloudRain,
    iconCategory: "rain",
  },
  71: {
    code: 71,
    label: "Slight Snow",
    description: "Scattered light snowfall with minor accumulation.",
    severity: "low",
    icon: CloudSnow,
    iconCategory: "snow",
  },
  73: {
    code: 73,
    label: "Moderate Snow",
    description: "Steady snowfall with moderate drift and accumulation.",
    severity: "moderate",
    icon: CloudSnow,
    iconCategory: "snow",
  },
  75: {
    code: 75,
    label: "Heavy Snow",
    description: "Major snow event with reduced travel visibility and accumulation.",
    severity: "high",
    icon: CloudSnow,
    iconCategory: "snow",
  },
  77: {
    code: 77,
    label: "Snow Grains",
    description: "Tiny opaque ice grains falling from stratiform clouds.",
    severity: "low",
    icon: CloudSnow,
    iconCategory: "snow",
  },
  80: {
    code: 80,
    label: "Slight Rain Showers",
    description: "Brief, passing light rain showers.",
    severity: "low",
    icon: CloudRain,
    iconCategory: "rain",
  },
  81: {
    code: 81,
    label: "Moderate Rain Showers",
    description: "Frequent rain showers with brief heavy bursts.",
    severity: "moderate",
    icon: CloudRain,
    iconCategory: "rain",
  },
  82: {
    code: 82,
    label: "Violent Rain Showers",
    description: "Torrential squalls with rapid flash runoff potential.",
    severity: "high",
    icon: CloudRain,
    iconCategory: "rain",
  },
  85: {
    code: 85,
    label: "Slight Snow Showers",
    description: "Passing convective snow showers.",
    severity: "low",
    icon: CloudSnow,
    iconCategory: "snow",
  },
  86: {
    code: 86,
    label: "Heavy Snow Showers",
    description: "Convective snow squalls with rapid whiteout conditions.",
    severity: "high",
    icon: CloudSnow,
    iconCategory: "snow",
  },
  95: {
    code: 95,
    label: "Thunderstorm",
    description: "Convective storm with lightning discharges and gusty winds.",
    severity: "high",
    icon: CloudLightning,
    iconCategory: "thunderstorm",
  },
  96: {
    code: 96,
    label: "Thunderstorm with Slight Hail",
    description: "Severe convective cell producing small hail and lightning.",
    severity: "high",
    icon: CloudLightning,
    iconCategory: "thunderstorm",
  },
  99: {
    code: 99,
    label: "Severe Thunderstorm with Heavy Hail",
    description: "Extreme storm cell with damaging hail, lightning, and destructive gusts.",
    severity: "critical",
    icon: CloudLightning,
    iconCategory: "thunderstorm",
  },
};

export const DEFAULT_WEATHER_INTERPRETATION: WmoWeatherInterpretation = {
  code: 0,
  label: "Clear / Variable",
  description: "Normal meteorological conditions.",
  severity: "low",
  icon: Sun,
  iconCategory: "clear",
};

/**
 * Returns the interpretation record for a given WMO weather code.
 */
export function getWmoWeatherInterpretation(code?: number): WmoWeatherInterpretation {
  if (code === undefined || code === null || !(code in WMO_WEATHER_CODES)) {
    return DEFAULT_WEATHER_INTERPRETATION;
  }
  return WMO_WEATHER_CODES[code];
}
