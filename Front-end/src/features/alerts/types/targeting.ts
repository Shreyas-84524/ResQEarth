import type { TargetMode } from "./alert";

export interface TargetRecipientCriteria {
  targetMode: TargetMode;
  regionName?: string;
  cityName?: string;
  stateName?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  requireNotificationConsent?: boolean;
  requireSmsConsent?: boolean;
  channel?: "all" | "fcm" | "sms" | "in-site";
}

export interface TargetingPreviewEstimate {
  targetMode: TargetMode;
  totalMatchedUsers: number;
  fcmEligibleCount: number;
  smsEligibleCount: number;
  inSiteEligibleCount: number;
  missingLocationCount: number;
  invalidLocationCount: number;
  summaryDescription: string;
  calculatedAt: string;
}

export interface MatchedRecipient {
  uid: string;
  hasFcmConsent: boolean;
  hasSmsConsent: boolean;
  phone?: string;
  distanceKm?: number;
  matchReason: string;
}

export interface UserLocationMatchResult {
  matches: boolean;
  distanceKm?: number;
  reason: string;
}
