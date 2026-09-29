export interface CookieConsentPreferences {
  essential: true; // Always true
  functional: boolean; // Map layers, dark/light theme, emergency kit checklists
  analytics: boolean; // Latency telemetry, error logging
  hasConsented: boolean;
  updatedAt: string;
}

export const DEFAULT_COOKIE_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  functional: true,
  analytics: false,
  hasConsented: false,
  updatedAt: new Date().toISOString(),
};
