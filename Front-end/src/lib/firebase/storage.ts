import { getStorage, type FirebaseStorage } from "firebase/storage";
import { initializeFirebaseApp } from "./app";

let cachedStorage: FirebaseStorage | null = null;

/**
 * Initializes and returns the Firebase Storage instance safely.
 * Returns null if the Firebase app is not initialized.
 */
export function getFirebaseStorageSafe(): FirebaseStorage | null {
  if (cachedStorage) {
    return cachedStorage;
  }

  const app = initializeFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    cachedStorage = getStorage(app);
    return cachedStorage;
  } catch (error) {
    console.error("[ResQEarth Storage] Failed to initialize Firebase Storage:", error);
    return null;
  }
}

/**
 * Direct accessor for Firebase Storage.
 * Throws an explicit error if Firebase is not initialized.
 */
export function getFirebaseStorage(): FirebaseStorage {
  const storage = getFirebaseStorageSafe();
  if (!storage) {
    throw new Error(
      "[ResQEarth Storage] Firebase Storage is not initialized. Ensure Firebase environment variables are configured."
    );
  }
  return storage;
}
