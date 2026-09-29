import { z } from "zod";

/**
 * Validates standard phone numbers (supports Indian 10-digit mobile with optional +91 / 0 prefix and formatting spaces/dashes).
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const digitsOnly = phone.replace(/\D/g, "");

  // 10 digits: must start with 6, 7, 8, or 9
  if (digitsOnly.length === 10) {
    return /^[6-9]\d{9}$/.test(digitsOnly);
  }

  // 11 digits: starting with 0, then 10 digits starting with 6-9
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return /^[6-9]\d{9}$/.test(digitsOnly.slice(1));
  }

  // 12 digits: starting with country code 91, then 10 digits starting with 6-9
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return /^[6-9]\d{9}$/.test(digitsOnly.slice(2));
  }

  return false;
}

/**
 * Regex for password complexity:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,.~`|\\])[A-Za-z\d@$!%*?&#^()_\-+={}[\]:;"'<>,.~`|\\]{8,}$/;

/**
 * Validation schema for Citizen Signup form.
 */
export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .regex(
        /^[a-zA-Z\s.'-]+$/,
        "Name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .max(20, "Phone number is too long")
      .refine(isValidPhoneNumber, {
        message:
          "Please enter a valid 10-digit mobile number (e.g. +91 98765 43210 or 9876543210)",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(
        PASSWORD_COMPLEXITY_REGEX,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Normalizes phone numbers to standard E.164 format for India (+91XXXXXXXXXX).
 */
export function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return `+91${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
}
