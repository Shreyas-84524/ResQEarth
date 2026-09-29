export interface SmsGatewayConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  maxRetries: number;
  mockMode: boolean;
}

export interface SendSmsRequest {
  phoneNumber: string;
  message: string;
  requestId?: string;
  userId?: string;
  alertId?: string;
  messagePart?: 1 | 2;
  hasConsent?: boolean;
}

export interface SendSmsResponse {
  success: boolean;
  messageId?: string | number;
  requestId?: string;
  status: "queued" | "sent" | "delivered" | "failed" | "simulated";
  timestamp: string;
  maskedPhone: string;
  phoneHash: string;
  error?: string;
}

export interface SmsDeliveryRecord {
  id: string;
  alertId: string;
  userId: string;
  messagePart: 1 | 2;
  maskedPhone: string;
  phoneHash: string;
  status: "queued" | "sent" | "delivered" | "failed";
  createdAt: string;
  dispatchedAt?: string;
  providerReference?: string;
  safeErrorCode?: string;
}
