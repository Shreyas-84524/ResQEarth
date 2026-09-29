import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirebaseConfig, isFirebaseConfigured, getFirebaseConfigValidationErrors } from "./config";

let cachedApp: FirebaseApp | null = null;

/**
 * Initializes and returns the singleton FirebaseApp instance safely.
 * Returns null if Firebase configuration is missing or incomplete,
 * preventing build-time and SSR runtime crashes.
 */
export function initializeFirebaseApp(): FirebaseApp | null {
  if (cachedApp) {
    return cachedApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  if (!isFirebaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      const errors = getFirebaseConfigValidationErrors();
      console.warn(
        `[ResQEarth Firebase] Firebase configuration is incomplete. Running in unconfigured mode. Missing:\n  - ${errors.join(
          "\n  - "
        )}`
      );
    }
    return null;
  }

  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  try {
    cachedApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket || undefined,
      messagingSenderId: config.messagingSenderId || undefined,
      appId: config.appId,
      measurementId: config.measurementId || undefined,
    });
    return cachedApp;
  } catch (error) {
    console.error("[ResQEarth Firebase] Failed to initialize Firebase app:", error);
    return null;
  }
}

/**
 * Safe accessor for the FirebaseApp instance.
 * Returns null if uninitialized/unconfigured.
 */
export function getFirebaseAppSafe(): FirebaseApp | null {
  return initializeFirebaseApp();
}

/**
 * Direct accessor for the FirebaseApp instance.
 * Throws an explicit error if accessed when Firebase is not configured.
 */
export function getFirebaseApp(): FirebaseApp {
  const app = initializeFirebaseApp();
  if (!app) {
    throw new Error(
      "[ResQEarth Firebase] Firebase app is not initialized. Please configure NEXT_PUBLIC_FIREBASE_* environment variables in .env.local."
    );
  }
  return app;
}
