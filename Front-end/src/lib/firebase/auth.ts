import { getAuth, type Auth } from "firebase/auth";
import { initializeFirebaseApp } from "./app";

let cachedAuth: Auth | null = null;

/**
 * Initializes and returns the Firebase Auth instance safely.
 * Returns null if the Firebase app is not initialized.
 */
export function getFirebaseAuthSafe(): Auth | null {
  if (cachedAuth) {
    return cachedAuth;
  }

  const app = initializeFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (error) {
    console.error("[ResQEarth Firebase Auth] Failed to initialize Auth:", error);
    return null;
  }
}

/**
 * Direct accessor for Firebase Auth.
 * Throws an explicit error if Firebase is not initialized.
 */
export function getFirebaseAuth(): Auth {
  const auth = getFirebaseAuthSafe();
  if (!auth) {
    throw new Error(
      "[ResQEarth Firebase Auth] Firebase Auth is not initialized. Ensure Firebase environment variables are configured."
    );
  }
  return auth;
}
