import type { UnifiedAlert } from "@/features/alerts";
import type { MatchedRecipient } from "@/features/alerts/types/targeting";
import type {
  SmsGatewayConfig,
  SendSmsResponse,
} from "./types";
import { sendSingleSms } from "./gateway-client";

export interface TwoMessageWorkflowParams {
  alert: UnifiedAlert;
  recipients: MatchedRecipient[];
  configOverrides?: Partial<SmsGatewayConfig>;
  baseUrl?: string;
}

export interface TwoMessageWorkflowResult {
  alertId: string;
  totalRecipients: number;
  part1Successful: number;
  part2Successful: number;
  failedCount: number;
  partialSuccessCount: number;
  completedAt: string;
  recipientResults: Array<{
    uid: string;
    part1: SendSmsResponse;
    part2?: SendSmsResponse;
  }>;
}

// In-memory idempotency tracking: key = `${alertId}:${uid}:${part}`
const dispatchedMessageKeys = new Set<string>();

/**
 * Builds Part 1 SMS (Hazard Alert, Region, Precautions, Short Link)
 */
export function buildAlertPart1Message(
  alert: UnifiedAlert,
  siteBaseUrl: string = "https://resqearth.org"
): string {
  const prefix = alert.isOfficialAlert
    ? `[OFFICIAL ALERT - ${alert.source}]`
    : `[RESQEARTH EMERGENCY ALERT]`;

  const regionText = alert.region ? ` for ${alert.region}` : "";
  const slug = alert.disasterType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const link = `${siteBaseUrl}/disasters/${slug}`;

  const topPrecautions = (alert.instructions || []).slice(0, 2).join(". ");
  const instructionsText = topPrecautions ? `\nActions: ${topPrecautions}` : "";

  return `${prefix}\n${alert.title}${regionText}\nSeverity: ${alert.severity}${instructionsText}\nFull Details: ${link}`;
}

/**
 * Builds Part 2 SMS (Verified Emergency Helplines)
 */
export function buildAlertPart2Message(alert: UnifiedAlert): string {
  const shortId = alert.id.slice(0, 8);
  return `[EMERGENCY HELPLINES - INDIA]\nNational Emergency: 112\nPolice: 100 | Fire: 101 | Ambulance: 108\nDisaster Response Helpline: 1070 / 1077\nRef ID: ${shortId}`;
}

/**
 * Executes the complete sequential two-message emergency workflow
 */
export async function executeTwoMessageSmsWorkflow(
  params: TwoMessageWorkflowParams
): Promise<TwoMessageWorkflowResult> {
  const { alert, recipients, configOverrides, baseUrl } = params;

  const part1Body = buildAlertPart1Message(alert, baseUrl);
  const part2Body = buildAlertPart2Message(alert);

  let part1Successful = 0;
  let part2Successful = 0;
  let failedCount = 0;
  let partialSuccessCount = 0;

  const recipientResults: TwoMessageWorkflowResult["recipientResults"] = [];

  for (const recipient of recipients) {
    if (!recipient.phone || !recipient.hasSmsConsent) {
      continue;
    }

    const keyPart1 = `${alert.id}:${recipient.uid}:1`;
    const keyPart2 = `${alert.id}:${recipient.uid}:2`;

    let part1Res: SendSmsResponse;
    let part2Res: SendSmsResponse | undefined;

    // Dispatch Part 1 (Idempotent check)
    if (dispatchedMessageKeys.has(keyPart1)) {
      part1Res = {
        success: true,
        status: "delivered",
        timestamp: new Date().toISOString(),
        maskedPhone: recipient.phone,
        phoneHash: `cached_${recipient.uid}`,
      };
      part1Successful++;
    } else {
      part1Res = await sendSingleSms(
        {
          phoneNumber: recipient.phone,
          message: part1Body,
          requestId: `req-${alert.id}-${recipient.uid}-1`,
          userId: recipient.uid,
          alertId: alert.id,
          messagePart: 1,
          hasConsent: recipient.hasSmsConsent,
        },
        configOverrides
      );

      if (part1Res.success) {
        dispatchedMessageKeys.add(keyPart1);
        part1Successful++;
      }
    }

    // Dispatch Part 2 if Part 1 was initiated
    if (part1Res.success) {
      if (dispatchedMessageKeys.has(keyPart2)) {
        part2Res = {
          success: true,
          status: "delivered",
          timestamp: new Date().toISOString(),
          maskedPhone: recipient.phone,
          phoneHash: `cached_${recipient.uid}`,
        };
        part2Successful++;
      } else {
        part2Res = await sendSingleSms(
          {
            phoneNumber: recipient.phone,
            message: part2Body,
            requestId: `req-${alert.id}-${recipient.uid}-2`,
            userId: recipient.uid,
            alertId: alert.id,
            messagePart: 2,
            hasConsent: recipient.hasSmsConsent,
          },
          configOverrides
        );

        if (part2Res.success) {
          dispatchedMessageKeys.add(keyPart2);
          part2Successful++;
        } else {
          partialSuccessCount++;
        }
      }
    } else {
      failedCount++;
    }

    recipientResults.push({
      uid: recipient.uid,
      part1: part1Res,
      part2: part2Res,
    });
  }

  return {
    alertId: alert.id,
    totalRecipients: recipients.length,
    part1Successful,
    part2Successful,
    failedCount,
    partialSuccessCount,
    completedAt: new Date().toISOString(),
    recipientResults,
  };
}

/**
 * Resets the dispatched keys set (used for unit tests)
 */
export function clearDispatchedSmsKeys(): void {
  dispatchedMessageKeys.clear();
}
