import type { CreateAlertInput } from "./alert";
import type { RiskAssessment } from "@/features/risk/types";
import type { UnifiedDisasterEvent } from "@/features/disasters/types";

export interface AutomaticAlertEngineConfig {
  minRiskScoreThreshold: number; // Default 60 (HIGH)
  cooldownMs: number; // Default 6 hours (21600000 ms)
  defaultRadiusKm: number; // Default 30 km
  autoActivate: boolean; // Default true
}

export interface AutomaticEvaluationInputs {
  riskAssessment?: RiskAssessment | null;
  disasters?: UnifiedDisasterEvent[];
  userLat?: number;
  userLon?: number;
  regionName?: string;
}

export interface AutomaticAlertGenerationResult {
  generatedAlerts: CreateAlertInput[];
  suppressedCount: number;
  suppressionReasons: Array<{ deduplicationKey: string; reason: string }>;
  evaluatedAt: string;
}

export interface ActiveCooldownRecord {
  deduplicationKey: string;
  alertId?: string;
  generatedAt: number;
  expiresAt: number;
}
