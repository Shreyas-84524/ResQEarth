import { getToken, onMessage, type MessagePayload, type Unsubscribe } from "firebase/messaging";
import { getFirebaseMessagingSafe, getFirebaseVapidKey, isMessagingSupported } from "@/lib/firebase/messaging";

/**
 * Requests browser notification permission and retrieves an FCM registration token.
 * Returns null if permissions are denied, messaging is unsupported, or VAPID key is missing.
 */
export async function requestNotificationPermissionAndToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isMessagingSupported();
  if (!supported) {
    console.warn("[ResQEarth FCM] Messaging is not supported in this browser environment.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.info("[ResQEarth FCM] Notification permission not granted:", permission);
      return null;
    }

    const messaging = await getFirebaseMessagingSafe();
    if (!messaging) {
      return null;
    }

    const vapidKey = getFirebaseVapidKey();
    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
    });

    return token;
  } catch (error) {
    console.error("[ResQEarth FCM] Error obtaining FCM token:", error);
    return null;
  }
}

/**
 * Listens for foreground FCM messages.
 * Returns an unsubscription function.
 */
export async function subscribeToForegroundMessages(
  onMessageReceived: (payload: MessagePayload) => void
): Promise<Unsubscribe> {
  const messaging = await getFirebaseMessagingSafe();
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    onMessageReceived(payload);
  });
}
