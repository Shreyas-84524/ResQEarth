import {
  type User,
  type Unsubscribe,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuthSafe } from "@/lib/firebase/auth";

/**
 * Subscribes to Firebase Authentication state changes safely.
 * Returns an empty unsubscription function if Firebase is unconfigured.
 */
export function subscribeToAuthState(
  onUserChanged: (user: User | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const auth = getFirebaseAuthSafe();
  if (!auth) {
    onUserChanged(null);
    return () => {};
  }

  return onAuthStateChanged(
    auth,
    (user) => {
      onUserChanged(user);
    },
    (error) => {
      console.error("[ResQEarth Auth Service] Auth state change error:", error);
      if (onError) onError(error);
    }
  );
}

/**
 * Returns the currently signed-in user or null if unauthenticated / unconfigured.
 */
export function getCurrentAuthUser(): User | null {
  const auth = getFirebaseAuthSafe();
  return auth ? auth.currentUser : null;
}

/**
 * Returns the current user's ID token, or null if unauthenticated.
 */
export async function getAuthIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentAuthUser();
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error("[ResQEarth Auth Service] Failed to fetch ID token:", error);
    return null;
  }
}

/**
 * Signs out the current user safely.
 */
export async function signOutAuthUser(): Promise<void> {
  const auth = getFirebaseAuthSafe();
  if (auth) {
    await firebaseSignOut(auth);
  }
}
