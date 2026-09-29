/**
 * Sanitizes and normalizes phone numbers into E.164 format
 */
export function sanitizeE164Phone(
  rawPhone: string,
  defaultCountryCode: string = "+91"
): { valid: boolean; formatted: string; reason?: string } {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { valid: false, formatted: "", reason: "Phone number is empty or invalid" };
  }

  // Remove spaces, hyphens, brackets, dots
  let cleaned = rawPhone.replace(/[\s\-().]/g, "").trim();

  // If already starts with '+', validate length
  if (cleaned.startsWith("+")) {
    const digitsOnly = cleaned.slice(1);
    if (/^\d{10,15}$/.test(digitsOnly)) {
      return { valid: true, formatted: cleaned };
    }
    return { valid: false, formatted: cleaned, reason: "Invalid international format length" };
  }

  // If starts with '00', replace with '+'
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
    const digitsOnly = cleaned.slice(1);
    if (/^\d{10,15}$/.test(digitsOnly)) {
      return { valid: true, formatted: cleaned };
    }
    return { valid: false, formatted: cleaned, reason: "Invalid 00-prefixed international format" };
  }

  // If 10 digits (Standard Indian mobile number), prepend default country code
  if (/^\d{10}$/.test(cleaned)) {
    return { valid: true, formatted: `${defaultCountryCode}${cleaned}` };
  }

  // If 11 digits starting with '0', strip leading '0' and prepend country code
  if (/^0\d{10}$/.test(cleaned)) {
    return { valid: true, formatted: `${defaultCountryCode}${cleaned.slice(1)}` };
  }

  // If 12 digits starting with '91', prepend '+'
  if (/^91\d{10}$/.test(cleaned)) {
    return { valid: true, formatted: `+${cleaned}` };
  }

  return { valid: false, formatted: cleaned, reason: "Unrecognized phone number format" };
}

/**
 * Masks middle digits of a phone number for privacy-safe logging
 * Example: "+919876543210" -> "+91 ****** 3210"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) {
    return "******";
  }

  const clean = phone.trim();
  const prefix = clean.startsWith("+") ? clean.slice(0, 3) : clean.slice(0, 2);
  const suffix = clean.slice(-4);

  return `${prefix} ****** ${suffix}`;
}

/**
 * Creates a deterministic hash for phone number indexing without storing raw PII
 */
export function hashPhoneNumber(phone: string): string {
  const clean = phone.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `phone_hash_${hex}`;
}
