import type {
  NotificationPermissionStatus,
  StoredNotificationToken,
} from "../types";
import { isMessagingSupported, getFirebaseMessagingSafe, getFirebaseVapidKey } from "@/lib/firebase/messaging";
import { getToken, deleteToken } from "firebase/messaging";
import { getFirebaseFirestoreSafe } from "@/lib/firebase/firestore";
import { doc, setDoc, updateDoc, collection, getDocs, writeBatch } from "firebase/firestore";

// Local storage key for permission preference
const NOTIFICATION_PREF_KEY = "resqearth_notification_preference";

// In-memory fallback token store for offline / test environments
const inMemoryTokenStore = new Map<string, Map<string, StoredNotificationToken>>();

/**
 * Creates a deterministic hash from token string for safe document IDs
 */
export function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const prefix = token.slice(0, 8).replace(/[^a-zA-Z0-9]/g, "");
  return `token_${prefix}_${hex}`;
}

/**
 * Checks current browser notification permission status without prompting
 */
export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Checks if the user previously denied notifications to avoid nagging prompts
 */
export function hasUserDeniedNotifications(): boolean {
  if (typeof window === "undefined") return false;

  if (getNotificationPermissionStatus() === "denied") {
    return true;
  }

  try {
    const pref = localStorage.getItem(NOTIFICATION_PREF_KEY);
    return pref === "denied";
  } catch {
    return false;
  }
}

/**
 * Requests browser permission and retrieves FCM Web Push token
 */
export async function requestAndRegisterFcmToken(
  uid?: string
): Promise<{ token: string | null; error?: string }> {
  if (typeof window === "undefined") {
    return { token: null, error: "Server-side environment not supported" };
  }

  const supported = await isMessagingSupported();
  if (!supported) {
    return { token: null, error: "Push notifications are not supported on this browser" };
  }

  try {
    // If user previously denied, do not re-prompt
    if (Notification.permission === "denied") {
      try {
        localStorage.setItem(NOTIFICATION_PREF_KEY, "denied");
      } catch {}
      return { token: null, error: "Notification permission was previously denied" };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      try {
        localStorage.setItem(NOTIFICATION_PREF_KEY, permission);
      } catch {}
      return { token: null, error: `Notification permission ${permission}` };
    }

    try {
      localStorage.setItem(NOTIFICATION_PREF_KEY, "granted");
    } catch {}

    const messaging = await getFirebaseMessagingSafe();
    if (!messaging) {
      // Return simulated token for mock / offline fallback
      const mockToken = `mock_fcm_token_${Math.random().toString(36).substring(2, 12)}`;
      if (uid) {
        await saveTokenRecord(uid, mockToken);
      }
      return { token: mockToken };
    }

    const vapidKey = getFirebaseVapidKey();
    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
    });

    if (token && uid) {
      await saveTokenRecord(uid, token);
    }

    return { token };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to obtain push token";
    console.error("[ResQEarth FCM Service]", message);
    return { token: null, error: message };
  }
}

/**
 * Saves or updates token record in Firestore `users/{uid}/notificationTokens/{tokenHash}`
 */
export async function saveTokenRecord(
  uid: string,
  token: string
): Promise<StoredNotificationToken> {
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const record: StoredNotificationToken = {
    token,
    tokenHash,
    platform: "web",
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
    status: "active",
  };

  // In-memory fallback
  if (!inMemoryTokenStore.has(uid)) {
    inMemoryTokenStore.set(uid, new Map());
  }
  inMemoryTokenStore.get(uid)!.set(tokenHash, record);

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const tokenRef = doc(db, "users", uid, "notificationTokens", tokenHash);
      await setDoc(tokenRef, record, { merge: true });

      // Update user notificationConsent
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { notificationConsent: true, updatedAt: now });
    } catch (err) {
      console.warn("[ResQEarth FCM] Firestore token write failed, using local store:", err);
    }
  }

  return record;
}

/**
 * Revokes an FCM token and marks it invalid in store
 */
export async function revokeTokenRecord(uid: string, token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  // In-memory
  const userTokens = inMemoryTokenStore.get(uid);
  if (userTokens && userTokens.has(tokenHash)) {
    const existing = userTokens.get(tokenHash)!;
    existing.status = "revoked";
    existing.updatedAt = now;
  }

  const messaging = await getFirebaseMessagingSafe();
  if (messaging) {
    try {
      await deleteToken(messaging);
    } catch {}
  }

  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const tokenRef = doc(db, "users", uid, "notificationTokens", tokenHash);
      await updateDoc(tokenRef, { status: "revoked", updatedAt: now });
    } catch (err) {
      console.warn("[ResQEarth FCM] Firestore token revoke failed:", err);
    }
  }

  return true;
}

/**
 * Cleans up invalid/expired tokens for a user
 */
export async function cleanupInvalidTokens(
  uid: string,
  invalidTokens: string[]
): Promise<number> {
  let cleanedCount = 0;
  const now = new Date().toISOString();

  const userTokens = inMemoryTokenStore.get(uid);

  for (const token of invalidTokens) {
    const tokenHash = hashToken(token);
    if (userTokens && userTokens.has(tokenHash)) {
      userTokens.get(tokenHash)!.status = "invalid";
      userTokens.get(tokenHash)!.updatedAt = now;
      cleanedCount++;
    }
  }

  const db = getFirebaseFirestoreSafe();
  if (db && invalidTokens.length > 0) {
    try {
      const batch = writeBatch(db);
      for (const token of invalidTokens) {
        const tokenHash = hashToken(token);
        const tokenRef = doc(db, "users", uid, "notificationTokens", tokenHash);
        batch.update(tokenRef, { status: "invalid", updatedAt: now });
      }
      await batch.commit();
    } catch (err) {
      console.warn("[ResQEarth FCM] Batch token cleanup failed:", err);
    }
  }

  return cleanedCount;
}

/**
 * Gets all active tokens for a user (used for offline / test inspection)
 */
export async function getUserTokens(uid: string): Promise<StoredNotificationToken[]> {
  const db = getFirebaseFirestoreSafe();
  if (db) {
    try {
      const tokensRef = collection(db, "users", uid, "notificationTokens");
      const snapshot = await getDocs(tokensRef);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => d.data() as StoredNotificationToken);
      }
    } catch {}
  }

  const userTokens = inMemoryTokenStore.get(uid);
  if (userTokens) {
    return Array.from(userTokens.values());
  }

  return [];
}

/**
 * Clears in-memory token store (for testing)
 */
export function clearInMemoryTokenStore(): void {
  inMemoryTokenStore.clear();
}
