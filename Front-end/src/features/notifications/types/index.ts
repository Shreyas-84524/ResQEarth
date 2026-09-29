export type NotificationPermissionStatus =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export interface DisasterNotificationPayload {
  alertId: string;
  title: string;
  body: string;
  disasterType: string;
  severity: "LOW" | "GUARDED" | "MODERATE" | "HIGH" | "CRITICAL";
  isOfficialAlert: boolean;
  region?: string;
  url?: string;
  slug?: string;
  timestamp?: string;
}

export interface StoredNotificationToken {
  token: string;
  tokenHash: string;
  platform: "web";
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  status: "active" | "invalid" | "revoked";
}

export interface FcmServiceState {
  permission: NotificationPermissionStatus;
  token: string | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}
