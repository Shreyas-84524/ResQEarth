import { ALLOWED_STATUS_TRANSITIONS, DEFAULT_ALERT_EXPIRY_HOURS } from "../constants";
import type { AlertStatus, UnifiedAlert } from "../types";
import type { RiskLevel } from "@/types";

export interface StateTransitionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether a state transition from currentStatus to targetStatus is permitted.
 */
export function validateStatusTransition(
  currentStatus: AlertStatus,
  targetStatus: AlertStatus
): StateTransitionResult {
  if (currentStatus === targetStatus) {
    return {
      allowed: true,
      reason: `No-op: already in state '${currentStatus}'`,
    };
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];

  if (!allowedNext || !allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid transition: cannot move alert from '${currentStatus}' to '${targetStatus}'. Allowed transitions from '${currentStatus}': [${allowedNext.join(
        ", "
      )}]`,
    };
  }

  return { allowed: true };
}

/**
 * Checks whether an alert is currently active in both status and time validity.
 */
export function isAlertActive(alert: Pick<UnifiedAlert, "status" | "expiresAt">): boolean {
  if (alert.status !== "active") return false;
  const expiryTime = new Date(alert.expiresAt).getTime();
  return !isNaN(expiryTime) && expiryTime > Date.now();
}

/**
 * Checks whether an alert has naturally expired past its expiresAt timestamp.
 */
export function isAlertExpired(alert: Pick<UnifiedAlert, "status" | "expiresAt">): boolean {
  if (alert.status === "expired") return true;
  const expiryTime = new Date(alert.expiresAt).getTime();
  return !isNaN(expiryTime) && expiryTime <= Date.now();
}

/**
 * Computes the effective runtime status of an alert.
 * Returns 'expired' if an active alert has reached its expiry timestamp.
 */
export function computeEffectiveStatus(
  alert: Pick<UnifiedAlert, "status" | "expiresAt">
): AlertStatus {
  if (alert.status === "active" && isAlertExpired(alert)) {
    return "expired";
  }
  return alert.status;
}

/**
 * Derives default ISO expiration string based on severity level and baseline timestamp.
 */
export function deriveDefaultExpiration(
  severity: RiskLevel,
  baseDate: Date = new Date()
): string {
  const hours = DEFAULT_ALERT_EXPIRY_HOURS[severity] ?? 24;
  const expiryDate = new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
  return expiryDate.toISOString();
}
