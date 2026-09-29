import {
  CookieConsentPreferences,
  DEFAULT_COOKIE_PREFERENCES,
} from "../types";

const COOKIE_STORAGE_KEY = "resqearth_cookie_consent";

/**
 * Retrieve saved cookie and local storage preferences from browser localStorage.
 */
export function getStoredCookiePreferences(): CookieConsentPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_COOKIE_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return DEFAULT_COOKIE_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      essential: true,
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      hasConsented: true,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return DEFAULT_COOKIE_PREFERENCES;
  }
}

/**
 * Persist user-defined cookie preferences to browser localStorage.
 */
export function saveCookiePreferences(
  prefs: Partial<CookieConsentPreferences>
): CookieConsentPreferences {
  const updated: CookieConsentPreferences = {
    essential: true,
    functional: prefs.functional ?? true,
    analytics: prefs.analytics ?? false,
    hasConsented: true,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors in private browsing modes
    }
  }

  return updated;
}

/**
 * Helper to accept all optional storage permissions.
 */
export function acceptAllCookies(): CookieConsentPreferences {
  return saveCookiePreferences({ functional: true, analytics: true });
}

/**
 * Helper to accept only mandatory essential storage permissions.
 */
export function acceptEssentialOnly(): CookieConsentPreferences {
  return saveCookiePreferences({ functional: false, analytics: false });
}
