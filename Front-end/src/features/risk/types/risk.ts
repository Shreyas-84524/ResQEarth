import type { RiskLevel } from "@/types";
import type { NormalizedWeather } from "@/features/weather/types";
import type { UnifiedDisasterEvent } from "@/features/disasters/types";

export type { RiskLevel };

export type RiskConfidence = "HIGH" | "MODERATE" | "LOW";

export type RiskFactorCategory =
  | "precipitation"
  | "wind"
  | "temperature"
  | "earthquake"
  | "global_event"
  | "official_alert"
  | "regional_vulnerability";

export interface RiskFactorContribution {
  id: string;
  name: string;
  category: RiskFactorCategory;
  points: number;
  description: string;
  source: string;
  isOfficialStatutory?: boolean;
  observedValue?: string | number;
}

export type HazardCategoryKey =
  | "flood"
  | "storm"
  | "earthquake"
  | "heatwave"
  | "wildfire";

export interface DisasterCategoryRisk {
  category: HazardCategoryKey;
  title: string;
  score: number;
  level: RiskLevel;
  dominantFactor: string;
  contributingPoints: number;
}

export interface RiskAssessment {
  score: number; // 0–100 clamped
  level: RiskLevel;
  confidence: RiskConfidence;
  disasterType: string;
  regionName: string;
  calculatedAt: string; // ISO 8601
  modelVersion: string; // "v1.0.0-deterministic"
  contributions: RiskFactorContribution[];
  hazardBreakdown: DisasterCategoryRisk[];
  summaryExplanation: string;
  missingInputs: string[];
  activeOfficialAlertsCount: number;
  highestContributingCategory: string;
  totalUnclampedPoints: number;
  latitude: number;
  longitude: number;
}

export interface RiskEngineLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface RiskEngineInputs {
  location?: RiskEngineLocation | null;
  weather?: NormalizedWeather | null;
  disasters?: UnifiedDisasterEvent[];
  isWeatherLoading?: boolean;
  isDisastersLoading?: boolean;
  weatherError?: string | null;
  disastersError?: string | null;
}
