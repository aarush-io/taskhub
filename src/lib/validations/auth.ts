import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(24, "Username must be under 24 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
    email: z.string().email("Enter a valid email address"),
    redditUsername: z
      .string()
      .min(3, "Enter your Reddit username")
      .max(24, "Reddit username is too long")
      .optional()
      .or(z.literal("")),
    referralCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6,12}$/, "Invalid referral code").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(24, "Username must be under 24 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().email("Enter a valid email address"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Include at least one uppercase letter").regex(/[0-9]/, "Include at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
