import { z } from "zod";

/**
 * Zod schema for Firebase Client Configuration.
 * All client configuration keys are public (prefixed with NEXT_PUBLIC_).
 */
export const firebaseClientConfigSchema = z.object({
  apiKey: z.string().min(1, "Firebase API Key is required"),
  authDomain: z.string().min(1, "Firebase Auth Domain is required"),
  projectId: z.string().min(1, "Firebase Project ID is required"),
  storageBucket: z.string().optional().default(""),
  messagingSenderId: z.string().optional().default(""),
  appId: z.string().min(1, "Firebase App ID is required"),
  measurementId: z.string().optional(),
  vapidKey: z.string().optional(),
});

export type FirebaseClientConfig = z.infer<typeof firebaseClientConfigSchema>;

/**
 * Raw configuration extracted from environment variables.
 */
export function getRawFirebaseConfig(): Record<string, string | undefined> {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim(),
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim(),
  };
}

/**
 * Checks whether all required Firebase configuration environment variables are defined.
 */
export function isFirebaseConfigured(): boolean {
  const raw = getRawFirebaseConfig();
  return Boolean(
    raw.apiKey &&
      raw.authDomain &&
      raw.projectId &&
      raw.appId &&
      raw.apiKey.length > 0 &&
      raw.authDomain.length > 0 &&
      raw.projectId.length > 0 &&
      raw.appId.length > 0
  );
}

/**
 * Validates and returns the parsed Firebase configuration.
 * Returns null if the configuration is incomplete or invalid.
 */
export function getFirebaseConfig(): FirebaseClientConfig | null {
  const raw = getRawFirebaseConfig();
  const parsed = firebaseClientConfigSchema.safeParse(raw);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

/**
 * Returns detailed diagnostic errors if the Firebase configuration is invalid.
 */
export function getFirebaseConfigValidationErrors(): string[] {
  const raw = getRawFirebaseConfig();
  const parsed = firebaseClientConfigSchema.safeParse(raw);

  if (parsed.success) {
    return [];
  }

  return parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
}
