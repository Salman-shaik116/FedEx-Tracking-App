import { z } from "zod";

export const signupSchema = z.object({
  email: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
});
