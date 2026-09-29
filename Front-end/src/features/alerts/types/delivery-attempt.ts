export type DeliveryChannel = "in-site" | "fcm" | "sms";

export type DeliveryStatus = "pending" | "in-progress" | "completed" | "failed";

export interface DeliveryAttempt {
  id: string;
  alertId: string;
  channel: DeliveryChannel;
  targetRecipientCount: number;
  sentCount: number;
  failedCount: number;
  status: DeliveryStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  dispatchedAt?: string;
  completedAt?: string;
  providerReference?: string;
  safeErrorCode?: string;
  errorDetails?: string;
}

export interface RecordDeliveryAttemptInput {
  alertId: string;
  channel: DeliveryChannel;
  targetRecipientCount: number;
  sentCount?: number;
  failedCount?: number;
  status?: DeliveryStatus;
  providerReference?: string;
  safeErrorCode?: string;
  errorDetails?: string;
}
