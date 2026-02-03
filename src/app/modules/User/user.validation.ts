import { z } from "zod";

const CreateUserValidationSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s]*$/, "Full name can only contain letters and spaces"),
  email: z.string().email("Invalid email address").toLowerCase(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must not exceed 50 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),

  fcmToken: z.string().optional(),
});

const UserLoginValidationSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fcmToken: z.string().optional(),
});

const userUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1)
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s]*$/, "Full name can only contain letters and spaces")
    .optional(),
  country: z
    .string()
    .max(50, "Country must not exceed 50 characters")
    .optional(),
  isCompleteProfile: z.boolean().optional(),
});

const completeProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s]*$/, "Full name can only contain letters and spaces"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
});

const verifyRegistrationOtpSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  otp: z.number().int().min(1000).max(9999),
});

const resendRegistrationOtpSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
});

export const UserValidation = {
  CreateUserValidationSchema,
  UserLoginValidationSchema,
  userUpdateSchema,
  completeProfileSchema,
  verifyRegistrationOtpSchema,
  resendRegistrationOtpSchema,
};
