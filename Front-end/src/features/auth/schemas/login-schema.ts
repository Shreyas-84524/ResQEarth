import { z } from "zod";

/**
 * Validation schema for Citizen Login form.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginFormData = z.infer<typeof loginSchema>;
