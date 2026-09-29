import {
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
  type AuthError,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuthSafe } from "@/lib/firebase/auth";
import { getFirebaseFirestoreSafe, FIRESTORE_COLLECTIONS, FIRESTORE_SUBCOLLECTIONS } from "@/lib/firebase/firestore";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { UserProfile, UserPreferences } from "@/types";
import { type SignupFormData, normalizePhoneNumber } from "../schemas/signup-schema";

export interface SignupResult {
  success: boolean;
  user?: User;
  profile?: UserProfile;
  error?: string;
  partialSuccess?: boolean;
}

/**
 * Maps Firebase Auth error codes to user-friendly accessible messages.
 */
export function mapFirebaseAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected error occurred during signup. Please try again.";
  }

  const authError = error as AuthError;
  switch (authError.code) {
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/invalid-email":
      return "The email address provided is not valid.";
    case "auth/operation-not-allowed":
      return "Email and password accounts are not enabled in Firebase Console. Please contact the administrator.";
    case "auth/weak-password":
      return "The password is too weak. Please use a stronger password with uppercase, lowercase, numbers, and symbols.";
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many signup attempts have been made. Please try again after a few minutes.";
    case "auth/invalid-api-key":
    case "auth/app-not-authorized":
      return "Firebase configuration is invalid. Please check your project settings.";
    default:
      return authError.message || "Failed to create account. Please try again.";
  }
}

/**
 * Registers a new citizen user with Firebase Auth and initializes their Firestore profile.
 * - Always assigns `role: "citizen"` (server-controlled role).
 * - Initializes `notificationConsent: false` and `smsConsent: false`.
 * - Sets up default disaster preferences.
 * - Prevents client role escalation.
 */
export async function registerCitizen(data: SignupFormData): Promise<SignupResult> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      error:
        "Firebase is not configured. Please define NEXT_PUBLIC_FIREBASE_* credentials in .env.local to enable real account registration.",
    };
  }

  const auth = getFirebaseAuthSafe();
  const db = getFirebaseFirestoreSafe();

  if (!auth || !db) {
    return {
      success: false,
      error: "Firebase services could not be initialized. Please verify your environment configuration.",
    };
  }

  const normalizedPhone = normalizePhoneNumber(data.phone);
  const now = new Date().toISOString();

  let createdUser: User | null = null;

  try {
    // 1. Create user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email.trim().toLowerCase(),
      data.password
    );
    createdUser = userCredential.user;

    // 2. Update user profile display name
    await updateProfile(createdUser, {
      displayName: data.name.trim(),
    });

    // 3. Prepare citizen profile document
    const userProfile: UserProfile = {
      uid: createdUser.uid,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: normalizedPhone,
      role: "citizen", // Explicitly hardcoded to citizen
      notificationConsent: false,
      smsConsent: false,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Prepare default preferences
    const defaultPreferences: UserPreferences = {
      disasterTypes: [
        "flood",
        "cyclone",
        "earthquake",
        "landslide",
        "heat-wave",
        "chemical-leak",
      ],
      radiiKm: [10, 25, 50, 100],
      channelChoices: {
        inSite: true,
        fcm: false,
        sms: false,
      },
      locationMode: "auto",
      cookiePreferences: {
        essentialOnly: true,
        updatedAt: now,
      },
    };

    // 5. Write to Firestore `users/{uid}` and `users/{uid}/preferences/default`
    try {
      const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, createdUser.uid);
      await setDoc(userDocRef, userProfile);

      const prefDocRef = doc(
        db,
        FIRESTORE_COLLECTIONS.USERS,
        createdUser.uid,
        FIRESTORE_SUBCOLLECTIONS.PREFERENCES,
        "default"
      );
      await setDoc(prefDocRef, defaultPreferences);
    } catch (firestoreError) {
      console.error("[ResQEarth Auth] Firestore profile creation failed:", firestoreError);
      return {
        success: false,
        partialSuccess: true,
        user: createdUser,
        error:
          "Your Firebase Auth account was created successfully, but your Firestore citizen profile could not be initialized. Please sign in to complete your profile setup.",
      };
    }

    return {
      success: true,
      user: createdUser,
      profile: userProfile,
    };
  } catch (error) {
    console.error("[ResQEarth Auth] Signup error:", error);
    return {
      success: false,
      error: mapFirebaseAuthErrorMessage(error),
    };
  }
}
