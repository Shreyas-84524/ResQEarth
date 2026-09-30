import { NextResponse } from "next/server";
import { getFirebaseFirestoreSafe, FIRESTORE_COLLECTIONS, FIRESTORE_SUBCOLLECTIONS } from "@/lib/firebase/firestore";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/types/firebase";
import type { UnifiedAlert, CreateAlertInput } from "@/features/alerts";
import {
  findMatchedRecipients,
  calculateTargetingEstimate,
  MOCK_RECIPIENT_USERS,
} from "@/features/alerts/services/targeting-service";
import { executeTwoMessageSmsWorkflow } from "@/services/sms/two-message-workflow";
import type { SendSmsResponse } from "@/services/sms/types";

// In-memory sliding-window rate limiter per admin UID (max 5 broadcasts per 60 seconds)
const rateLimitWindow = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// In-memory duplicate dispatch tracker within 5 minutes
const recentDispatches = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 5 * 60 * 1000;

interface DispatchWarningRequestBody {
  alertData: CreateAlertInput;
  channels: {
    inSite?: boolean;
    fcm?: boolean;
    sms?: boolean;
  };
  isSimulation?: boolean;
}

/**
 * Validates admin authorization via Firebase ID token / Authorization header
 */
async function verifyAdminAuth(req: Request): Promise<{ authorized: boolean; uid: string; error?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authorized: false, uid: "", error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return { authorized: false, uid: "", error: "Empty authentication token provided" };
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    // Development fallback if API key is not in environment
    return { authorized: true, uid: "dev-admin-fallback" };
  }

  try {
    // Validate token with Google Identity Toolkit
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!verifyRes.ok) {
      return { authorized: false, uid: "", error: "Invalid or expired Firebase ID token" };
    }

    const verifyData = await verifyRes.json();
    const userRecord = verifyData.users?.[0];
    if (!userRecord || !userRecord.localId) {
      return { authorized: false, uid: "", error: "User record not found in Firebase Auth" };
    }

    const uid = userRecord.localId;

    // Check Firestore user profile for admin role
    const db = getFirebaseFirestoreSafe();
    if (db) {
      try {
        const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          if (profile.role !== "admin") {
            return {
              authorized: false,
              uid,
              error: `Forbidden: User role '${profile.role || "citizen"}' is not authorized. Admin role required.`,
            };
          }
        }
      } catch (err) {
        console.warn("[Admin Dispatch API] Firestore profile check warning:", err);
      }
    }

    return { authorized: true, uid };
  } catch (error) {
    console.error("[Admin Dispatch API] Token verification error:", error);
    return { authorized: false, uid: "", error: "Authentication verification failed" };
  }
}

/**
 * Checks in-memory rate limits for emergency broadcasts
 */
function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitWindow.get(uid) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  timestamps.push(now);
  rateLimitWindow.set(uid, timestamps);
  return true;
}

/**
 * Checks duplicate warning dispatch
 */
function checkDuplicateDispatch(dedupKey: string): boolean {
  const now = Date.now();
  const lastTime = recentDispatches.get(dedupKey);
  if (lastTime && now - lastTime < DEDUPLICATION_WINDOW_MS) {
    return true;
  }
  recentDispatches.set(dedupKey, now);
  return true ? false : false; // false = not a duplicate, safe to proceed
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate and authorize admin
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Unauthorized: Admin access required",
        },
        { status: 401 }
      );
    }

    const adminUid = authResult.uid;

    // 2. Rate limiting check
    if (!checkRateLimit(adminUid)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Emergency warning broadcasts are limited to 5 dispatches per minute.",
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate request body
    const body = (await req.json()) as DispatchWarningRequestBody;
    const { alertData, channels = { inSite: true, fcm: true, sms: true }, isSimulation = true } = body;

    if (!alertData || !alertData.title || !alertData.disasterType) {
      return NextResponse.json(
        { success: false, error: "Missing required alert fields (title, disasterType)." },
        { status: 400 }
      );
    }

    // 4. Construct canonical alert
    const now = new Date().toISOString();
    const alertId = `alert-admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const dedupKey = `admin:${alertData.disasterType}:${alertData.region || "all"}:${alertData.severity}`;

    if (checkDuplicateDispatch(dedupKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate dispatch blocked: An identical emergency warning was broadcast recently. Please wait or update parameters.",
        },
        { status: 409 }
      );
    }

    const canonicalAlert: UnifiedAlert = {
      id: alertId,
      title: isSimulation
        ? `[SIMULATION / DEMO ALERT] ${alertData.title}`
        : alertData.title,
      description: alertData.description,
      disasterType: alertData.disasterType,
      severity: alertData.severity,
      source: isSimulation
        ? "ResQEarth Academic Simulation"
        : "ResQEarth Emergency Operations Center",
      sourceType: "manual-admin",
      isOfficialAlert: false, // Strict: Never pretend to be statutory NDMA/IMD
      region: alertData.region,
      latitude: alertData.latitude,
      longitude: alertData.longitude,
      radiusKm: alertData.radiusKm,
      targetMode: alertData.targetMode || "radius",
      instructions: alertData.instructions || [],
      createdAt: now,
      updatedAt: now,
      expiresAt:
        alertData.expiresAt ||
        new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      createdBy: adminUid,
      status: "active",
      deduplicationKey: dedupKey,
      metadata: {
        isSimulation,
        channels,
        targetMode: alertData.targetMode,
        dispatchedBy: adminUid,
      },
    };

    // 5. Fetch registered users from Firestore (or fallback to simulated users)
    let registeredUsers: UserProfile[] = [];
    const db = getFirebaseFirestoreSafe();

    if (db) {
      try {
        const usersCollection = collection(db, FIRESTORE_COLLECTIONS.USERS);
        const userDocs = await getDocs(usersCollection);
        userDocs.forEach((d) => {
          registeredUsers.push(d.data() as UserProfile);
        });
      } catch (err) {
        console.warn("[Admin Dispatch API] Error fetching users from Firestore:", err);
      }
    }

    // If Firestore has fewer than 2 users (e.g. fresh DB or offline test), merge mock users for rich simulation
    if (registeredUsers.length === 0) {
      registeredUsers = [...MOCK_RECIPIENT_USERS];
    }

    // 6. Calculate Targeting Breakdown
    const targetingEstimate = calculateTargetingEstimate(registeredUsers, {
      targetMode: canonicalAlert.targetMode,
      latitude: canonicalAlert.latitude,
      longitude: canonicalAlert.longitude,
      radiusKm: canonicalAlert.radiusKm,
      regionName: canonicalAlert.region,
    });

    // 7. Find Matched Recipients with SMS Consent & Valid Phone
    const matchedSmsRecipients = findMatchedRecipients(registeredUsers, {
      targetMode: canonicalAlert.targetMode,
      latitude: canonicalAlert.latitude,
      longitude: canonicalAlert.longitude,
      radiusKm: canonicalAlert.radiusKm,
      regionName: canonicalAlert.region,
      channel: "sms",
      requireSmsConsent: true,
    });

    // 8. Execute SMS Dispatch Workflow if SMS channel is requested
    let smsWorkflowResult = {
      totalRecipients: matchedSmsRecipients.length,
      part1Successful: 0,
      part2Successful: 0,
      failedCount: 0,
      partialSuccessCount: 0,
      completedAt: now,
      recipientResults: [] as Array<{ uid: string; part1: SendSmsResponse; part2?: SendSmsResponse }>,
    };

    if (channels.sms && matchedSmsRecipients.length > 0) {
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://resqearth.antideploy.app";
      smsWorkflowResult = await executeTwoMessageSmsWorkflow({
        alert: canonicalAlert,
        recipients: matchedSmsRecipients,
        baseUrl: siteUrl,
        configOverrides: {
          baseUrl: process.env.SMS_GATEWAY_URL || "http://localhost:8080/api",
          apiKey: process.env.SMS_GATEWAY_API_KEY || "",
        },
      });
    }

    // 9. Persist Alert & Delivery Logs to Firestore
    if (db) {
      try {
        // Save alert document
        const alertDocRef = doc(db, FIRESTORE_COLLECTIONS.ALERTS, alertId);
        await setDoc(alertDocRef, canonicalAlert);

        // Record delivery attempt subcollection
        if (channels.sms) {
          const attemptId = `attempt-sms-${Date.now()}`;
          const attemptDocRef = doc(
            db,
            FIRESTORE_COLLECTIONS.ALERTS,
            alertId,
            FIRESTORE_SUBCOLLECTIONS.DELIVERY_ATTEMPTS,
            attemptId
          );
          await setDoc(attemptDocRef, {
            id: attemptId,
            alertId,
            channel: "sms",
            targetRecipientCount: targetingEstimate.smsEligibleCount,
            sentCount: smsWorkflowResult.part1Successful,
            failedCount: smsWorkflowResult.failedCount,
            status: smsWorkflowResult.failedCount === 0 ? "completed" : "partial",
            attemptedAt: now,
            completedAt: smsWorkflowResult.completedAt,
            isSimulation,
          });
        }
      } catch (err) {
        console.warn("[Admin Dispatch API] Firestore alert persistence warning:", err);
      }
    }

    // 10. Return Privacy-Safe Aggregate Response (Zero PII Exposed)
    return NextResponse.json({
      success: true,
      alertId,
      title: canonicalAlert.title,
      isSimulation,
      disasterType: canonicalAlert.disasterType,
      region: canonicalAlert.region,
      targeting: {
        totalMatchedUsers: targetingEstimate.totalMatchedUsers,
        smsEligibleCount: targetingEstimate.smsEligibleCount,
        missingLocationCount: targetingEstimate.missingLocationCount,
        summary: targetingEstimate.summaryDescription,
      },
      dispatch: {
        channels,
        smsRecipientsCount: matchedSmsRecipients.length,
        part1SentCount: smsWorkflowResult.part1Successful,
        part2SentCount: smsWorkflowResult.part2Successful,
        failedCount: smsWorkflowResult.failedCount,
        status: smsWorkflowResult.failedCount === 0 ? "success" : "partial",
      },
      message: `Emergency warning '${canonicalAlert.title}' created. Two-message SMS workflow dispatched to ${smsWorkflowResult.part1Successful} eligible recipients.`,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error during warning dispatch";
    console.error("[Admin Dispatch API] Uncaught handler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
