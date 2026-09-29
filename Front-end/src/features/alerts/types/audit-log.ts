import type { UserRole } from "@/types";

export type AlertAuditAction =
  | "alert.created"
  | "alert.activated"
  | "alert.updated"
  | "alert.expired"
  | "alert.cancelled"
  | "alert.superseded"
  | "alert.delivery_attempted"
  | "alert.permission_denied";

export type AuditOutcome = "success" | "denied" | "failed";

export interface AlertAuditLogEntry {
  id: string;
  actorUid: string;
  actorRole: UserRole;
  action: AlertAuditAction;
  resource: "alerts";
  resourceId: string;
  timestamp: string; // ISO 8601
  correlationId: string;
  outcome: AuditOutcome;
  details?: {
    previousStatus?: string;
    nextStatus?: string;
    reason?: string;
    diff?: Record<string, unknown>;
    supersededById?: string;
    supersedesAlertId?: string;
    targetMode?: string;
    recipientEstimate?: number;
    [key: string]: unknown;
  };
}

export interface CreateAlertAuditLogInput {
  actorUid: string;
  actorRole: UserRole;
  action: AlertAuditAction;
  resourceId: string;
  correlationId?: string;
  outcome: AuditOutcome;
  details?: Record<string, unknown>;
}
