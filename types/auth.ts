import { z } from "zod";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+94\d{9}$/, "Phone must be a valid Sri Lankan number (+94XXXXXXXXX)")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const phoneOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+94\d{9}$/, "Phone must be a valid Sri Lankan number (+94XXXXXXXXX)"),
});

export type PhoneOtpFormData = z.infer<typeof phoneOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+94\d{9}$/, "Invalid phone number"),
  token: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^\+94\d{9}$/, "Phone must be a valid Sri Lankan number (+94XXXXXXXXX)")
    .optional()
    .or(z.literal("")),
  whatsapp_opted_in: z.boolean().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
