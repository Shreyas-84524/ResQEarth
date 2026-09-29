import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { initializeFirebaseApp } from "./app";

let cachedAnalytics: Analytics | null = null;

/**
 * Initializes and returns the Firebase Analytics instance safely.
 * Returns null if running in SSR, unsupported browser, or unconfigured.
 */
export async function getFirebaseAnalyticsSafe(): Promise<Analytics | null> {
  if (cachedAnalytics) {
    return cachedAnalytics;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    const app = initializeFirebaseApp();
    if (!app) {
      return null;
    }

    cachedAnalytics = getAnalytics(app);
    return cachedAnalytics;
  } catch (error) {
    console.error("[ResQEarth Analytics] Failed to initialize Firebase Analytics:", error);
    return null;
  }
}
