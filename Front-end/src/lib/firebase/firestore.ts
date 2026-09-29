import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeFirebaseApp } from "./app";

let cachedFirestore: Firestore | null = null;

/**
 * Canonical Firestore Collection Names matching architecture.md
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  DISASTER_EVENTS: "disasterEvents",
  RISK_ASSESSMENTS: "riskAssessments",
  ALERTS: "alerts",
  SMS_DELIVERY_LOGS: "smsDeliveryLogs",
  AUDIT_LOGS: "auditLogs",
  SERVICE_STATUS: "serviceStatus",
} as const;

/**
 * Canonical Firestore Subcollection Names matching architecture.md
 */
export const FIRESTORE_SUBCOLLECTIONS = {
  PREFERENCES: "preferences",
  NOTIFICATION_TOKENS: "notificationTokens",
  DELIVERY_ATTEMPTS: "deliveryAttempts",
} as const;

/**
 * Initializes and returns the Firestore instance safely.
 * Returns null if the Firebase app is not initialized.
 */
export function getFirebaseFirestoreSafe(): Firestore | null {
  if (cachedFirestore) {
    return cachedFirestore;
  }

  const app = initializeFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    cachedFirestore = getFirestore(app);
    return cachedFirestore;
  } catch (error) {
    console.error("[ResQEarth Firestore] Failed to initialize Firestore:", error);
    return null;
  }
}

/**
 * Direct accessor for Firestore.
 * Throws an explicit error if Firebase is not initialized.
 */
export function getFirebaseFirestore(): Firestore {
  const db = getFirebaseFirestoreSafe();
  if (!db) {
    throw new Error(
      "[ResQEarth Firestore] Firestore is not initialized. Ensure Firebase environment variables are configured."
    );
  }
  return db;
}
