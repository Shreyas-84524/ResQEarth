import type { RiskLevel, AlertSourceType } from "@/types";

export type { AlertSourceType };

export type AlertStatus = "draft" | "active" | "expired" | "cancelled" | "superseded";

export type TargetMode = "all" | "state" | "city" | "region" | "radius";

export interface UnifiedAlert {
  id: string;
  title: string;
  description: string;
  disasterType: string;
  severity: RiskLevel;
  source: string;
  sourceType: AlertSourceType;
  isOfficialAlert: boolean; // Strictly true iff sourceType === 'official'
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  targetMode: TargetMode;
  instructions: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  createdBy: string; // UID of admin or 'system-risk-engine' or official provider
  status: AlertStatus;
  deduplicationKey: string;
  dedupeKey?: string;
  relatedDisasterEventId?: string;
  eventIds?: string[];
  riskScoreSnapshot?: number;
  supersededById?: string;
  supersedesAlertId?: string;
  cancellationReason?: string;
  metadata?: {
    isSimulation?: boolean;
    simulationLabel?: string;
    feedReference?: string;
    originalCapIdentifier?: string;
    affectedSubDistricts?: string[];
    [key: string]: unknown;
  };
}

export interface CreateAlertInput {
  title: string;
  description: string;
  disasterType: string;
  severity: RiskLevel;
  source: string;
  sourceType: AlertSourceType;
  isOfficialAlert?: boolean;
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  targetMode?: TargetMode;
  instructions?: string[];
  expiresAt: string;
  relatedDisasterEventId?: string;
  eventIds?: string[];
  riskScoreSnapshot?: number;
  status?: AlertStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateAlertInput {
  title?: string;
  description?: string;
  disasterType?: string;
  severity?: RiskLevel;
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  targetMode?: TargetMode;
  instructions?: string[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SupersedeAlertInput {
  oldAlertId: string;
  reason?: string;
  newAlertData: CreateAlertInput;
}

export interface AlertFilterOptions {
  status?: AlertStatus | AlertStatus[];
  disasterType?: string;
  severity?: RiskLevel | RiskLevel[];
  sourceType?: AlertSourceType | AlertSourceType[];
  isOfficialOnly?: boolean;
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  searchQuery?: string;
  includeExpired?: boolean;
}
