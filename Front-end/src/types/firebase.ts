import type { UserRole, RiskLevel, AlertSourceType, DisasterCategory } from "./index";

/**
 * User Profile Document stored in `users/{uid}`
 */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string; // Used for SMS alerts (not Firebase Phone Auth in MVP)
  role: UserRole;
  createdAt: string; // ISO 8601 timestamp
  updatedAt?: string; // ISO 8601 timestamp
  notificationConsent: boolean; // Browser FCM notification consent
  smsConsent: boolean; // Two-part SMS alert consent
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    cityName?: string;
    stateName?: string;
    precision?: string; // e.g., 'city', 'approximate', 'gps'
    updatedAt: string;
  };
}

/**
 * User Preferences Document stored in `users/{uid}/preferences/default`
 */
export interface UserPreferences {
  disasterTypes: string[];
  radiiKm: number[]; // e.g., [10, 25, 50, 100]
  channelChoices: {
    inSite: boolean;
    fcm: boolean;
    sms: boolean;
  };
  locationMode: "auto" | "manual";
  cookiePreferences: {
    essentialOnly: boolean;
    updatedAt: string;
  };
}

/**
 * Notification Token Document stored in `users/{uid}/notificationTokens/{tokenId}`
 */
export interface NotificationTokenRecord {
  tokenHash: string;
  platform: "web";
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  status: "active" | "invalid" | "revoked";
}

/**
 * Normalized Disaster Event stored in `disasterEvents/{eventId}`
 */
export interface DisasterEventDoc {
  id: string;
  provider: string; // e.g., 'open-meteo', 'usgs', 'eonet', 'sachet'
  providerEventId: string;
  disasterType: string;
  category: DisasterCategory;
  title: string;
  description: string;
  severity: RiskLevel;
  severityScale?: string;
  source: string;
  sourceUrl?: string;
  sourceType: "official" | "public-feed" | "curated";
  latitude?: number;
  longitude?: number;
  affectedRegions?: string[];
  occurredAt: string;
  updatedAt: string;
  expiresAt?: string;
  status: "active" | "resolved" | "expired";
  fetchedAt: string;
  freshness: "live" | "cached" | "stale";
}

/**
 * Unified Alert Document stored in `alerts/{alertId}`
 */
export interface AlertDoc {
  id: string;
  title: string;
  description: string;
  disasterType: string;
  severity: RiskLevel;
  source: string;
  sourceType: AlertSourceType;
  isOfficialAlert: boolean; // Strictly true iff sourceType === 'official', immutable
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  targetMode: "all" | "state" | "city" | "region" | "radius";
  instructions: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  createdBy: string; // UID of admin or 'system-risk-engine' or provider name
  status: "draft" | "active" | "expired" | "cancelled" | "superseded";
  deduplicationKey: string; // Deterministic deduplication key
  dedupeKey?: string; // Backwards compatible alias
  relatedDisasterEventId?: string;
  eventIds?: string[];
  riskScoreSnapshot?: number; // Snapshot of calculated risk score (0-100) if triggered by risk engine
  supersededById?: string;
  supersedesAlertId?: string;
  cancellationReason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Delivery Attempt Record stored in `alerts/{alertId}/deliveryAttempts/{attemptId}`
 */
export interface DeliveryAttemptDoc {
  id: string;
  alertId: string;
  channel: "in-site" | "fcm" | "sms";
  targetRecipientCount: number;
  sentCount: number;
  failedCount: number;
  status: "pending" | "in-progress" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  providerReference?: string;
  safeErrorCode?: string;
  errorDetails?: string;
}

/**
 * SMS Delivery Log stored in `smsDeliveryLogs/{logId}`
 */
export interface SmsDeliveryLogDoc {
  id: string;
  alertId: string;
  userId: string;
  messagePart: 1 | 2;
  phoneHash: string; // Masked/hashed for privacy
  maskedPhone: string; // e.g., +91 ****** 1234
  status: "queued" | "sent" | "delivered" | "failed";
  providerReference?: string;
  createdAt: string;
  dispatchedAt?: string;
  safeErrorCode?: string;
}

/**
 * Audit Log stored in `auditLogs/{logId}`
 */
export interface AuditLogDoc {
  id: string;
  actorUid: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  correlationId: string;
  outcome: "success" | "denied" | "failed";
  details?: Record<string, unknown>;
}

/**
 * Service Status Document stored in `serviceStatus/{serviceId}`
 */
export interface ServiceStatusDoc {
  serviceId: string;
  providerName: string;
  health: "healthy" | "degraded" | "down" | "unverified";
  lastAttemptAt: string;
  lastSuccessAt?: string;
  freshness: "live" | "stale" | "unknown";
  safeErrorSummary?: string;
}
