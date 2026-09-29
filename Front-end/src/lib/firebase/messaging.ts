import { getMessaging, isSupported, type Messaging } from "firebase/messaging";
import { initializeFirebaseApp } from "./app";
import { getFirebaseConfig } from "./config";

let cachedMessaging: Messaging | null = null;

/**
 * Checks if Firebase Cloud Messaging is supported in the current environment.
 * Guards against SSR (Node.js) and unsupported browsers.
 */
export async function isMessagingSupported(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

/**
 * Initializes and returns the Firebase Messaging instance safely.
 * Returns null if running in SSR, if browser is unsupported, or if Firebase is unconfigured.
 */
export async function getFirebaseMessagingSafe(): Promise<Messaging | null> {
  if (cachedMessaging) {
    return cachedMessaging;
  }

  const supported = await isMessagingSupported();
  if (!supported) {
    return null;
  }

  const app = initializeFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    cachedMessaging = getMessaging(app);
    return cachedMessaging;
  } catch (error) {
    console.error("[ResQEarth FCM] Failed to initialize Firebase Messaging:", error);
    return null;
  }
}

/**
 * Returns the VAPID key configured for Web Push Notifications.
 */
export function getFirebaseVapidKey(): string | undefined {
  const config = getFirebaseConfig();
  return config?.vapidKey;
}
