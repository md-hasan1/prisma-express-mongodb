import { z } from "zod";

const loginValidationSchema = z.object({

    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password must not exceed 50 characters"),
    fcmToken: z.string().optional(),
  
});

const registerValidationSchema = z.object({
 
    fullName: z.string().min(1, "Full name is required").max(100, "Full name must not exceed 100 characters").regex(/^[a-zA-Z\s]*$/, "Full name can only contain letters and spaces"),
    email: z.string().email("Invalid email address").toLowerCase(),
    country: z.string().min(1, "Country is required").max(50, "Country must not exceed 50 characters"),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password must not exceed 50 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),

});

const changePasswordValidationSchema = z.object({

    oldPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(50, "Password must not exceed 50 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),

});

const forgotPasswordValidationSchema = z.object({

    email: z.string().email("Invalid email address").toLowerCase(),

});

const resendOtpValidationSchema = z.object({

    email: z.string().email("Invalid email address").toLowerCase(),
  
});

const verifyOtpValidationSchema = z.object({
 
    email: z.string().email("Invalid email address").toLowerCase(),
    otp: z.number().int().min(1000).max(9999),

});

const resetPasswordValidationSchema = z.object({

    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password must not exceed 50 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
   
});

export const authValidation = {
  loginValidationSchema,
  registerValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resendOtpValidationSchema,
  verifyOtpValidationSchema,
  resetPasswordValidationSchema,
};