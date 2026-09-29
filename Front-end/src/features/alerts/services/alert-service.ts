import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseFirestoreSafe, FIRESTORE_COLLECTIONS, FIRESTORE_SUBCOLLECTIONS } from "@/lib/firebase/firestore";
import { alertConverter, auditLogConverter } from "@/services/firebase/firestore";
import type { UserRole, RiskLevel, AlertSourceType } from "@/types";
import {
  createAlertSchema,
  updateAlertSchema,
  cancelAlertSchema,
  supersedeAlertSchema,
  recordDeliveryAttemptSchema,
} from "../schemas";
import type {
  UnifiedAlert,
  CreateAlertInput,
  UpdateAlertInput,
  SupersedeAlertInput,
  AlertFilterOptions,
  DeliveryAttempt,
  DeliveryChannel,
  RecordDeliveryAttemptInput,
  AlertAuditLogEntry,
  CreateAlertAuditLogInput,
  TargetMode,
} from "../types";
import { generateAlertDeduplicationKey } from "./deduplication-service";
import {
  validateStatusTransition,
  computeEffectiveStatus,
  deriveDefaultExpiration,
} from "./alert-lifecycle";

export interface UserAuthContext {
  uid: string;
  role: UserRole;
}

// In-memory backing store for testing and offline/uninitialized Firestore execution
const inMemoryAlertStore = new Map<string, UnifiedAlert>();
const inMemoryDeliveryAttempts = new Map<string, DeliveryAttempt[]>();
const inMemoryAuditLogs: AlertAuditLogEntry[] = [];

/**
 * Resets the in-memory test store.
 */
export function clearAlertServiceStore(): void {
  inMemoryAlertStore.clear();
  inMemoryDeliveryAttempts.clear();
  inMemoryAuditLogs.length = 0;
}

/**
 * Generates a unique document ID.
 */
function generateId(prefix: string = "alt"): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Helper to record audit log entries securely.
 */
export async function recordAlertAuditLog(
  input: CreateAlertAuditLogInput
): Promise<AlertAuditLogEntry> {
  const entry: AlertAuditLogEntry = {
    id: generateId("aud"),
    actorUid: input.actorUid,
    actorRole: input.actorRole,
    action: input.action,
    resource: "alerts",
    resourceId: input.resourceId,
    timestamp: new Date().toISOString(),
    correlationId: input.correlationId || generateId("corr"),
    outcome: input.outcome,
    details: input.details,
  };

  inMemoryAuditLogs.push(entry);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const auditCol = collection(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS).withConverter(
        auditLogConverter
      );
      await setDoc(doc(auditCol, entry.id), {
        id: entry.id,
        actorUid: entry.actorUid,
        actorRole: entry.actorRole,
        action: entry.action,
        resource: "alerts",
        resourceId: entry.resourceId,
        timestamp: entry.timestamp,
        correlationId: entry.correlationId,
        outcome: entry.outcome,
        details: entry.details,
      });
    } catch (err) {
      console.warn("[AlertService] Could not write audit log to Firestore:", err);
    }
  }

  return entry;
}

/**
 * Creates a new Alert (draft or active).
 *
 * Requirements:
 * - Caller must be an admin (or automated system)
 * - Validates schema with strict statutory provenance rules
 * - Generates deterministic deduplication key
 * - Writes to Firestore (with in-memory fallback)
 * - Emits audit log
 */
export async function createAlert(
  input: CreateAlertInput,
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert> {
  // 1. Authorization check: Citizens cannot create alerts
  if (!authContext || authContext.role !== "admin") {
    if (authContext) {
      await recordAlertAuditLog({
        actorUid: authContext.uid,
        actorRole: authContext.role,
        action: "alert.created",
        resourceId: "unauthorized",
        outcome: "denied",
        details: { reason: "Citizens cannot create alerts" },
      });
    }
    throw new Error("Unauthorized: Only administrators or authorized backend jobs can create alerts.");
  }

  // 2. Validate input schema
  const validated = createAlertSchema.parse(input);

  const now = new Date();
  const alertId = generateId("alt");

  // Determine statutory provenance
  const isOfficial = validated.sourceType === "official";

  // Generate deterministic deduplication key
  const deduplicationKey = generateAlertDeduplicationKey({
    sourceType: validated.sourceType as AlertSourceType,
    source: validated.source,
    disasterType: validated.disasterType,
    region: validated.region,
    latitude: validated.latitude,
    longitude: validated.longitude,
    radiusKm: validated.radiusKm,
    timestamp: now,
  });

  const alert: UnifiedAlert = {
    id: alertId,
    title: validated.title,
    description: validated.description,
    disasterType: validated.disasterType,
    severity: validated.severity as RiskLevel,
    source: validated.source,
    sourceType: validated.sourceType as AlertSourceType,
    isOfficialAlert: isOfficial,
    region: validated.region,
    latitude: validated.latitude,
    longitude: validated.longitude,
    radiusKm: validated.radiusKm,
    targetMode: validated.targetMode as TargetMode,
    instructions: validated.instructions,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: validated.expiresAt || deriveDefaultExpiration(validated.severity as RiskLevel, now),
    createdBy: authContext.uid,
    status: validated.status || "draft",
    deduplicationKey,
    dedupeKey: deduplicationKey,
    relatedDisasterEventId: validated.relatedDisasterEventId,
    eventIds: validated.eventIds,
    riskScoreSnapshot: validated.riskScoreSnapshot,
    metadata: validated.metadata,
  };

  // 3. Save to in-memory store
  inMemoryAlertStore.set(alert.id, alert);

  // 4. Save to Firestore if available
  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      await setDoc(doc(alertsCol, alert.id), alert);
    } catch (err) {
      console.warn("[AlertService] Could not persist alert to Firestore:", err);
    }
  }

  // 5. Emit audit log
  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.created",
    resourceId: alert.id,
    outcome: "success",
    details: {
      status: alert.status,
      disasterType: alert.disasterType,
      severity: alert.severity,
      sourceType: alert.sourceType,
      isOfficialAlert: alert.isOfficialAlert,
    },
  });

  return alert;
}

/**
 * Retrieves an alert by ID, respecting citizen/admin visibility.
 */
export async function getAlertById(
  alertId: string,
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert | null> {
  let alert = inMemoryAlertStore.get(alertId) || null;

  if (!alert) {
    const db = getFirebaseFirestoreSafe();
    if (db) {
      try {
        const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
        const snapshot = await getDoc(doc(alertsCol, alertId));
        if (snapshot.exists()) {
          alert = snapshot.data() as UnifiedAlert;
          inMemoryAlertStore.set(alert.id, alert);
        }
      } catch (err) {
        console.warn("[AlertService] Firestore getDoc failed:", err);
      }
    }
  }

  if (!alert) return null;

  // Citizens and guests can only view non-draft alerts
  const isAdmin = authContext?.role === "admin";
  if (!isAdmin && alert.status === "draft") {
    return null;
  }

  // Synchronize dynamic expiration
  const effectiveStatus = computeEffectiveStatus(alert);
  if (effectiveStatus !== alert.status) {
    alert = { ...alert, status: effectiveStatus };
    inMemoryAlertStore.set(alert.id, alert);
  }

  return alert;
}

/**
 * Queries alerts matching filters with permission-scoped visibility.
 */
export async function getAlerts(
  filters: AlertFilterOptions = {},
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert[]> {
  const isAdmin = authContext?.role === "admin";

  const alerts: UnifiedAlert[] = Array.from(inMemoryAlertStore.values());

  const db = getFirebaseFirestoreSafe();
  if (db && alerts.length === 0) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      const snapshot = await getDocs(alertsCol);
      snapshot.forEach((d) => {
        const data = d.data() as UnifiedAlert;
        alerts.push(data);
        inMemoryAlertStore.set(data.id, data);
      });
    } catch (err) {
      console.warn("[AlertService] Firestore getDocs failed:", err);
    }
  }

  return alerts.filter((alert) => {
    // 1. Visibility: Non-admins cannot see draft alerts
    if (!isAdmin && alert.status === "draft") {
      return false;
    }

    // 2. Dynamic expiration computation
    const effectiveStatus = computeEffectiveStatus(alert);

    // 3. Status filter
    if (filters.status) {
      const statusArr = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (!statusArr.includes(effectiveStatus)) {
        return false;
      }
    } else if (!filters.includeExpired && !isAdmin) {
      // By default, non-admin queries exclude expired/cancelled/superseded unless specified
      if (effectiveStatus !== "active") return false;
    }

    // 4. Disaster Type
    if (filters.disasterType && alert.disasterType.toLowerCase() !== filters.disasterType.toLowerCase()) {
      return false;
    }

    // 5. Severity
    if (filters.severity) {
      const severityArr = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
      if (!severityArr.includes(alert.severity)) {
        return false;
      }
    }

    // 6. Source Type
    if (filters.sourceType) {
      const sourceArr = Array.isArray(filters.sourceType) ? filters.sourceType : [filters.sourceType];
      if (!sourceArr.includes(alert.sourceType)) {
        return false;
      }
    }

    // 7. Official Only
    if (filters.isOfficialOnly && !alert.isOfficialAlert) {
      return false;
    }

    // 8. Region
    if (filters.region && alert.region) {
      if (!alert.region.toLowerCase().includes(filters.region.toLowerCase())) {
        return false;
      }
    }

    // 9. Keyword Search
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = alert.title.toLowerCase().includes(q);
      const matchDesc = alert.description.toLowerCase().includes(q);
      const matchRegion = alert.region?.toLowerCase().includes(q) ?? false;
      if (!matchTitle && !matchDesc && !matchRegion) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Updates mutable fields of an alert.
 *
 * Immutability guarantees:
 * - `id`, `createdAt`, `createdBy`, `sourceType`, `isOfficialAlert`, and `deduplicationKey` cannot be mutated.
 */
export async function updateAlert(
  alertId: string,
  updates: UpdateAlertInput,
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert> {
  if (!authContext || authContext.role !== "admin") {
    if (authContext) {
      await recordAlertAuditLog({
        actorUid: authContext.uid,
        actorRole: authContext.role,
        action: "alert.updated",
        resourceId: alertId,
        outcome: "denied",
        details: { reason: "Citizens cannot update alerts" },
      });
    }
    throw new Error("Unauthorized: Only administrators can update alerts.");
  }

  const existing = await getAlertById(alertId, authContext);
  if (!existing) {
    throw new Error(`Alert with ID '${alertId}' not found.`);
  }

  if (["expired", "cancelled", "superseded"].includes(existing.status)) {
    throw new Error(`Cannot update alert in terminal state '${existing.status}'.`);
  }

  const validated = updateAlertSchema.parse(updates);

  const updated: UnifiedAlert = {
    ...existing,
    ...validated,
    severity: (validated.severity as RiskLevel) ?? existing.severity,
    targetMode: (validated.targetMode as TargetMode) ?? existing.targetMode,
    instructions: validated.instructions ?? existing.instructions,
    updatedAt: new Date().toISOString(),
    // Preserve strict immutability
    id: existing.id,
    createdAt: existing.createdAt,
    createdBy: existing.createdBy,
    sourceType: existing.sourceType,
    isOfficialAlert: existing.isOfficialAlert,
    deduplicationKey: existing.deduplicationKey,
  };

  inMemoryAlertStore.set(updated.id, updated);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      await updateDoc(doc(alertsCol, updated.id), {
        title: updated.title,
        description: updated.description,
        disasterType: updated.disasterType,
        severity: updated.severity,
        region: updated.region ?? null,
        latitude: updated.latitude ?? null,
        longitude: updated.longitude ?? null,
        radiusKm: updated.radiusKm ?? null,
        targetMode: updated.targetMode,
        instructions: updated.instructions,
        expiresAt: updated.expiresAt,
        updatedAt: updated.updatedAt,
        metadata: updated.metadata ?? null,
      });
    } catch (err) {
      console.warn("[AlertService] Firestore updateDoc failed:", err);
    }
  }

  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.updated",
    resourceId: updated.id,
    outcome: "success",
    details: { diff: validated },
  });

  return updated;
}

/**
 * Transitions an alert to 'active'.
 */
export async function activateAlert(
  alertId: string,
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert> {
  if (!authContext || authContext.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can activate alerts.");
  }

  const existing = await getAlertById(alertId, authContext);
  if (!existing) {
    throw new Error(`Alert with ID '${alertId}' not found.`);
  }

  const transition = validateStatusTransition(existing.status, "active");
  if (!transition.allowed) {
    throw new Error(transition.reason);
  }

  const activated: UnifiedAlert = {
    ...existing,
    status: "active",
    updatedAt: new Date().toISOString(),
  };

  inMemoryAlertStore.set(activated.id, activated);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      await updateDoc(doc(alertsCol, activated.id), {
        status: "active",
        updatedAt: activated.updatedAt,
      });
    } catch (err) {
      console.warn("[AlertService] Firestore activate update failed:", err);
    }
  }

  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.activated",
    resourceId: activated.id,
    outcome: "success",
    details: { previousStatus: existing.status, nextStatus: "active" },
  });

  return activated;
}

/**
 * Transitions an alert to 'expired'.
 */
export async function expireAlert(
  alertId: string,
  reason?: string,
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert> {
  if (!authContext || authContext.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can manually expire alerts.");
  }

  const existing = await getAlertById(alertId, authContext);
  if (!existing) {
    throw new Error(`Alert with ID '${alertId}' not found.`);
  }

  const transition = validateStatusTransition(existing.status, "expired");
  if (!transition.allowed) {
    throw new Error(transition.reason);
  }

  const expired: UnifiedAlert = {
    ...existing,
    status: "expired",
    updatedAt: new Date().toISOString(),
  };

  inMemoryAlertStore.set(expired.id, expired);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      await updateDoc(doc(alertsCol, expired.id), {
        status: "expired",
        updatedAt: expired.updatedAt,
      });
    } catch (err) {
      console.warn("[AlertService] Firestore expire update failed:", err);
    }
  }

  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.expired",
    resourceId: expired.id,
    outcome: "success",
    details: { reason: reason || "Manual expiration" },
  });

  return expired;
}

/**
 * Transitions an alert to 'cancelled'.
 */
export async function cancelAlert(
  alertId: string,
  reason: string,
  authContext?: UserAuthContext | null
): Promise<UnifiedAlert> {
  if (!authContext || authContext.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can cancel alerts.");
  }

  const validatedCancel = cancelAlertSchema.parse({ alertId, reason });

  const existing = await getAlertById(validatedCancel.alertId, authContext);
  if (!existing) {
    throw new Error(`Alert with ID '${validatedCancel.alertId}' not found.`);
  }

  const transition = validateStatusTransition(existing.status, "cancelled");
  if (!transition.allowed) {
    throw new Error(transition.reason);
  }

  const cancelled: UnifiedAlert = {
    ...existing,
    status: "cancelled",
    cancellationReason: validatedCancel.reason,
    updatedAt: new Date().toISOString(),
  };

  inMemoryAlertStore.set(cancelled.id, cancelled);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      await updateDoc(doc(alertsCol, cancelled.id), {
        status: "cancelled",
        cancellationReason: cancelled.cancellationReason,
        updatedAt: cancelled.updatedAt,
      });
    } catch (err) {
      console.warn("[AlertService] Firestore cancel update failed:", err);
    }
  }

  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.cancelled",
    resourceId: cancelled.id,
    outcome: "success",
    details: { reason: validatedCancel.reason },
  });

  return cancelled;
}

/**
 * Supersedes an active alert: marks previous as superseded and creates replacement alert.
 */
export async function supersedeAlert(
  input: SupersedeAlertInput,
  authContext?: UserAuthContext | null
): Promise<{ supersededAlert: UnifiedAlert; newAlert: UnifiedAlert }> {
  if (!authContext || authContext.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can supersede alerts.");
  }

  const validated = supersedeAlertSchema.parse(input);

  const existing = await getAlertById(validated.oldAlertId, authContext);
  if (!existing) {
    throw new Error(`Alert to supersede '${validated.oldAlertId}' not found.`);
  }

  const transition = validateStatusTransition(existing.status, "superseded");
  if (!transition.allowed) {
    throw new Error(transition.reason);
  }

  // 1. Create the new alert
  const newAlert = await createAlert(
    {
      title: validated.newAlertData.title,
      description: validated.newAlertData.description,
      disasterType: validated.newAlertData.disasterType,
      severity: validated.newAlertData.severity as RiskLevel,
      source: validated.newAlertData.source,
      sourceType: validated.newAlertData.sourceType as AlertSourceType,
      isOfficialAlert: validated.newAlertData.isOfficialAlert,
      region: validated.newAlertData.region,
      latitude: validated.newAlertData.latitude,
      longitude: validated.newAlertData.longitude,
      radiusKm: validated.newAlertData.radiusKm,
      targetMode: validated.newAlertData.targetMode as TargetMode,
      instructions: validated.newAlertData.instructions,
      expiresAt: validated.newAlertData.expiresAt,
      relatedDisasterEventId: validated.newAlertData.relatedDisasterEventId,
      eventIds: validated.newAlertData.eventIds,
      riskScoreSnapshot: validated.newAlertData.riskScoreSnapshot,
      status: "active",
      metadata: validated.newAlertData.metadata,
    },
    authContext
  );

  // 2. Mark existing alert as superseded with reference to newAlert
  const supersededAlert: UnifiedAlert = {
    ...existing,
    status: "superseded",
    supersededById: newAlert.id,
    updatedAt: new Date().toISOString(),
  };

  inMemoryAlertStore.set(supersededAlert.id, supersededAlert);

  // Link back
  newAlert.supersedesAlertId = supersededAlert.id;
  inMemoryAlertStore.set(newAlert.id, newAlert);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const alertsCol = collection(db, FIRESTORE_COLLECTIONS.ALERTS).withConverter(alertConverter);
      await updateDoc(doc(alertsCol, supersededAlert.id), {
        status: "superseded",
        supersededById: newAlert.id,
        updatedAt: supersededAlert.updatedAt,
      });
      await updateDoc(doc(alertsCol, newAlert.id), {
        supersedesAlertId: supersededAlert.id,
      });
    } catch (err) {
      console.warn("[AlertService] Firestore supersede transaction update failed:", err);
    }
  }

  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.superseded",
    resourceId: supersededAlert.id,
    outcome: "success",
    details: {
      supersededById: newAlert.id,
      reason: validated.reason || "Superseded by newer warning",
    },
  });

  return { supersededAlert, newAlert };
}

/**
 * Records a delivery attempt under `alerts/{alertId}/deliveryAttempts/{attemptId}`.
 */
export async function recordDeliveryAttempt(
  input: RecordDeliveryAttemptInput,
  authContext?: UserAuthContext | null
): Promise<DeliveryAttempt> {
  if (!authContext || authContext.role !== "admin") {
    throw new Error("Unauthorized: Only administrators or authorized dispatchers can record delivery attempts.");
  }

  const validated = recordDeliveryAttemptSchema.parse(input);

  const attemptId = generateId("att");
  const now = new Date().toISOString();

  const attempt: DeliveryAttempt = {
    id: attemptId,
    alertId: validated.alertId,
    channel: validated.channel as DeliveryChannel,
    targetRecipientCount: validated.targetRecipientCount,
    sentCount: validated.sentCount,
    failedCount: validated.failedCount,
    status: validated.status,
    createdAt: now,
    updatedAt: now,
    providerReference: validated.providerReference,
    safeErrorCode: validated.safeErrorCode,
    errorDetails: validated.errorDetails,
  };

  const existingAttempts = inMemoryDeliveryAttempts.get(validated.alertId) || [];
  existingAttempts.push(attempt);
  inMemoryDeliveryAttempts.set(validated.alertId, existingAttempts);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const subCol = collection(
        db,
        FIRESTORE_COLLECTIONS.ALERTS,
        validated.alertId,
        FIRESTORE_SUBCOLLECTIONS.DELIVERY_ATTEMPTS
      );
      await setDoc(doc(subCol, attempt.id), attempt);
    } catch (err) {
      console.warn("[AlertService] Could not write delivery attempt to Firestore:", err);
    }
  }

  await recordAlertAuditLog({
    actorUid: authContext.uid,
    actorRole: authContext.role,
    action: "alert.delivery_attempted",
    resourceId: validated.alertId,
    outcome: validated.status === "failed" ? "failed" : "success",
    details: {
      channel: validated.channel,
      targetRecipientCount: validated.targetRecipientCount,
      sentCount: validated.sentCount,
      failedCount: validated.failedCount,
      status: validated.status,
    },
  });

  return attempt;
}

/**
 * Retrieves delivery attempts for an alert (Admin only).
 */
export async function getDeliveryAttempts(
  alertId: string,
  authContext?: UserAuthContext | null
): Promise<DeliveryAttempt[]> {
  if (!authContext || authContext.role !== "admin") {
    throw new Error("Unauthorized: Only administrators can view delivery attempts.");
  }

  const attempts = inMemoryDeliveryAttempts.get(alertId) || [];
  return attempts;
}
