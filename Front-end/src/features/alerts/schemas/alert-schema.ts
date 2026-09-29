import { z } from "zod";
import {
  ALERT_SOURCE_TYPES,
  ALERT_SEVERITIES,
  TARGET_MODES,
  DELIVERY_CHANNELS,
  ALERT_CONFIG,
} from "../constants";

/**
 * Validates ISO 8601 date string.
 */
const isoDateString = z.string().refine(
  (val) => {
    const parsed = Date.parse(val);
    return !isNaN(parsed);
  },
  { message: "Must be a valid ISO 8601 date string" }
);

/**
 * Schema for creating a new alert (draft or active).
 */
export const createAlertSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(ALERT_CONFIG.MIN_TITLE_LENGTH, "Title must be at least 3 characters")
      .max(ALERT_CONFIG.MAX_TITLE_LENGTH, "Title cannot exceed 300 characters"),
    description: z
      .string()
      .trim()
      .min(ALERT_CONFIG.MIN_DESCRIPTION_LENGTH, "Description must be at least 5 characters")
      .max(ALERT_CONFIG.MAX_DESCRIPTION_LENGTH, "Description cannot exceed 5000 characters"),
    disasterType: z
      .string()
      .trim()
      .min(2, "Disaster type is required")
      .max(100, "Disaster type cannot exceed 100 characters"),
    severity: z.enum(ALERT_SEVERITIES as [string, ...string[]]),
    source: z
      .string()
      .trim()
      .min(2, "Source identifier is required")
      .max(200, "Source cannot exceed 200 characters"),
    sourceType: z.enum(ALERT_SOURCE_TYPES as [string, ...string[]]),
    isOfficialAlert: z.boolean().optional(),
    region: z.string().trim().max(200).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().min(0).max(ALERT_CONFIG.MAX_RADIUS_KM).optional(),
    targetMode: z.enum(TARGET_MODES as [string, ...string[]]).default("region"),
    instructions: z
      .array(
        z.string().trim().max(ALERT_CONFIG.MAX_INSTRUCTION_LENGTH, "Instruction line too long")
      )
      .max(ALERT_CONFIG.MAX_INSTRUCTIONS_COUNT, "Too many instruction lines")
      .default([]),
    expiresAt: isoDateString,
    status: z.enum(["draft", "active"] as const).default("draft"),
    relatedDisasterEventId: z.string().trim().max(200).optional(),
    eventIds: z.array(z.string().trim().max(200)).max(50).optional(),
    riskScoreSnapshot: z.number().min(0).max(100).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Strict Statutory Provenance Invariant:
    // If sourceType === 'official', isOfficialAlert MUST be true.
    // If sourceType !== 'official', isOfficialAlert MUST NOT be true.
    if (data.sourceType === "official" && data.isOfficialAlert === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOfficialAlert"],
        message: "Statutory official alerts must have isOfficialAlert set to true.",
      });
    }

    if (data.sourceType !== "official" && data.isOfficialAlert === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["isOfficialAlert"],
        message:
          "Only statutory official sources (sourceType='official') can set isOfficialAlert=true. ResQEarth calculated risks and manual warnings must not be labeled official.",
      });
    }

    // 2. Radius Targeting requires coordinates
    if (data.targetMode === "radius") {
      if (data.latitude === undefined || data.longitude === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["targetMode"],
          message: "Target mode 'radius' requires both latitude and longitude coordinates.",
        });
      }
    }
  });

/**
 * Schema for updating an existing alert (strictly mutable fields).
 */
export const updateAlertSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(ALERT_CONFIG.MIN_TITLE_LENGTH)
      .max(ALERT_CONFIG.MAX_TITLE_LENGTH)
      .optional(),
    description: z
      .string()
      .trim()
      .min(ALERT_CONFIG.MIN_DESCRIPTION_LENGTH)
      .max(ALERT_CONFIG.MAX_DESCRIPTION_LENGTH)
      .optional(),
    disasterType: z.string().trim().min(2).max(100).optional(),
    severity: z.enum(ALERT_SEVERITIES as [string, ...string[]]).optional(),
    region: z.string().trim().max(200).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().min(0).max(ALERT_CONFIG.MAX_RADIUS_KM).optional(),
    targetMode: z.enum(TARGET_MODES as [string, ...string[]]).optional(),
    instructions: z
      .array(z.string().trim().max(ALERT_CONFIG.MAX_INSTRUCTION_LENGTH))
      .max(ALERT_CONFIG.MAX_INSTRUCTIONS_COUNT)
      .optional(),
    expiresAt: isoDateString.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

/**
 * Schema for superseding an active alert.
 */
export const supersedeAlertSchema = z.object({
  oldAlertId: z.string().trim().min(1, "Old alert ID is required"),
  reason: z.string().trim().max(500).optional(),
  newAlertData: createAlertSchema,
});

/**
 * Schema for cancelling an alert.
 */
export const cancelAlertSchema = z.object({
  alertId: z.string().trim().min(1, "Alert ID is required"),
  reason: z
    .string()
    .trim()
    .min(3, "Cancellation reason must be at least 3 characters")
    .max(500, "Cancellation reason cannot exceed 500 characters"),
});

/**
 * Schema for recording a delivery attempt.
 */
export const recordDeliveryAttemptSchema = z.object({
  alertId: z.string().trim().min(1, "Alert ID is required"),
  channel: z.enum(DELIVERY_CHANNELS as [string, ...string[]]),
  targetRecipientCount: z.number().int().min(0),
  sentCount: z.number().int().min(0).default(0),
  failedCount: z.number().int().min(0).default(0),
  status: z.enum(["pending", "in-progress", "completed", "failed"] as const).default("pending"),
  providerReference: z.string().trim().max(256).optional(),
  safeErrorCode: z.string().trim().max(100).optional(),
  errorDetails: z.string().trim().max(1000).optional(),
});

/**
 * Schema for audit log recording.
 */
export const createAuditLogSchema = z.object({
  actorUid: z.string().trim().min(1),
  actorRole: z.enum(["citizen", "admin"] as const),
  action: z.string().trim().min(1).max(100),
  resource: z.literal("alerts").default("alerts"),
  resourceId: z.string().trim().min(1),
  correlationId: z.string().trim().max(100).optional(),
  outcome: z.enum(["success", "denied", "failed"] as const),
  details: z.record(z.unknown()).optional(),
});

export type CreateAlertSchemaType = z.infer<typeof createAlertSchema>;
export type UpdateAlertSchemaType = z.infer<typeof updateAlertSchema>;
export type SupersedeAlertSchemaType = z.infer<typeof supersedeAlertSchema>;
export type CancelAlertSchemaType = z.infer<typeof cancelAlertSchema>;
export type RecordDeliveryAttemptSchemaType = z.infer<typeof recordDeliveryAttemptSchema>;
export type CreateAuditLogSchemaType = z.infer<typeof createAuditLogSchema>;
