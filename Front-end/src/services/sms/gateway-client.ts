import type {
  SmsGatewayConfig,
  SendSmsRequest,
  SendSmsResponse,
  SmsDeliveryRecord,
} from "./types";
import { sanitizeE164Phone, maskPhoneNumber, hashPhoneNumber } from "./phone-utils";
import { getFirebaseFirestoreSafe } from "@/lib/firebase/firestore";
import { doc, setDoc, collection } from "firebase/firestore";

const DEFAULT_CONFIG: SmsGatewayConfig = {
  baseUrl: process.env.SMS_GATEWAY_URL || "http://localhost:8080/api",
  apiKey: process.env.SMS_GATEWAY_API_KEY || "",
  timeoutMs: 5000,
  maxRetries: 3,
  mockMode: !process.env.SMS_GATEWAY_API_KEY,
};

// In-memory log store for testing and fallback
const inMemoryDeliveryLogs: SmsDeliveryRecord[] = [];

/**
 * Sends a single SMS with retries, timeout, and privacy-preserving logging
 */
export async function sendSingleSms(
  request: SendSmsRequest,
  configOverrides?: Partial<SmsGatewayConfig>
): Promise<SendSmsResponse> {
  const config: SmsGatewayConfig = { ...DEFAULT_CONFIG, ...configOverrides };
  const now = new Date().toISOString();

  // 1. Validate Consent
  if (request.hasConsent === false) {
    return {
      success: false,
      status: "failed",
      timestamp: now,
      maskedPhone: maskPhoneNumber(request.phoneNumber),
      phoneHash: hashPhoneNumber(request.phoneNumber),
      error: "Recipient has not consented to emergency SMS alerts",
    };
  }

  // 2. Validate and sanitize phone number
  const { valid, formatted, reason } = sanitizeE164Phone(request.phoneNumber);
  const masked = maskPhoneNumber(formatted || request.phoneNumber);
  const hashed = hashPhoneNumber(formatted || request.phoneNumber);

  if (!valid) {
    const errorMsg = `Invalid phone format: ${reason || "Unrecognized"}`;
    await recordDeliveryLog({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      alertId: request.alertId || "unspecified",
      userId: request.userId || "anonymous",
      messagePart: request.messagePart || 1,
      maskedPhone: masked,
      phoneHash: hashed,
      status: "failed",
      createdAt: now,
      safeErrorCode: "INVALID_PHONE_NUMBER",
    });

    return {
      success: false,
      status: "failed",
      timestamp: now,
      maskedPhone: masked,
      phoneHash: hashed,
      error: errorMsg,
    };
  }

  // 3. Simulated / Mock Mode Execution (when API key is empty or mockMode is forced)
  if (config.mockMode || !config.apiKey) {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const simMessageId = `sim-sms-${Math.floor(Math.random() * 1000000)}`;

    await recordDeliveryLog({
      id: logId,
      alertId: request.alertId || "unspecified",
      userId: request.userId || "anonymous",
      messagePart: request.messagePart || 1,
      maskedPhone: masked,
      phoneHash: hashed,
      status: "delivered",
      createdAt: now,
      dispatchedAt: now,
      providerReference: simMessageId,
    });

    return {
      success: true,
      messageId: simMessageId,
      requestId: request.requestId,
      status: "simulated",
      timestamp: now,
      maskedPhone: masked,
      phoneHash: hashed,
    };
  }

  // 4. Live Gateway HTTP Dispatch with Exponential Backoff
  let attempt = 0;
  let lastError = "Unknown error";

  while (attempt < config.maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(`${config.baseUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": config.apiKey,
        },
        body: JSON.stringify({
          phone_number: formatted,
          message: request.message,
          request_id: request.requestId || `req-${Date.now()}`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        await recordDeliveryLog({
          id: logId,
          alertId: request.alertId || "unspecified",
          userId: request.userId || "anonymous",
          messagePart: request.messagePart || 1,
          maskedPhone: masked,
          phoneHash: hashed,
          status: "delivered",
          createdAt: now,
          dispatchedAt: now,
          providerReference: String(data.sms_id || data.message_id || "sent"),
        });

        return {
          success: true,
          messageId: data.sms_id || data.message_id,
          requestId: request.requestId,
          status: "sent",
          timestamp: now,
          maskedPhone: masked,
          phoneHash: hashed,
        };
      }

      lastError = `Gateway HTTP ${response.status}: ${response.statusText}`;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err instanceof Error ? err.message : "Network dispatch failure";
    }

    // Wait with exponential backoff before next retry
    if (attempt < config.maxRetries) {
      const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  // Record failed delivery log
  const failLogId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  await recordDeliveryLog({
    id: failLogId,
    alertId: request.alertId || "unspecified",
    userId: request.userId || "anonymous",
    messagePart: request.messagePart || 1,
    maskedPhone: masked,
    phoneHash: hashed,
    status: "failed",
    createdAt: now,
    safeErrorCode: "GATEWAY_TIMEOUT_OR_ERROR",
  });

  return {
    success: false,
    status: "failed",
    timestamp: now,
    maskedPhone: masked,
    phoneHash: hashed,
    error: `Failed after ${config.maxRetries} attempts. Last error: ${lastError}`,
  };
}

/**
 * Bulk dispatch with concurrency throttle
 */
export async function sendBulkSms(
  requests: SendSmsRequest[],
  configOverrides?: Partial<SmsGatewayConfig>
): Promise<SendSmsResponse[]> {
  const results: SendSmsResponse[] = [];

  // Batch in chunks of 5
  const chunkSize = 5;
  for (let i = 0; i < requests.length; i += chunkSize) {
    const chunk = requests.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((req) => sendSingleSms(req, configOverrides))
    );
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Records an SMS delivery log entry safely in Firestore and in-memory
 */
async function recordDeliveryLog(entry: SmsDeliveryRecord): Promise<void> {
  inMemoryDeliveryLogs.push(entry);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const logRef = doc(collection(db, "smsDeliveryLogs"), entry.id);
      await setDoc(logRef, entry);
    } catch (err) {
      console.warn("[SmsGateway] Firestore delivery log write failed:", err);
    }
  }
}

/**
 * Retrieves delivery logs for testing / admin monitoring
 */
export function getSmsDeliveryLogs(alertId?: string): SmsDeliveryRecord[] {
  if (alertId) {
    return inMemoryDeliveryLogs.filter((l) => l.alertId === alertId);
  }
  return [...inMemoryDeliveryLogs];
}

/**
 * Clears in-memory logs
 */
export function clearSmsDeliveryLogs(): void {
  inMemoryDeliveryLogs.length = 0;
}
