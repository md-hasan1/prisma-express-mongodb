import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { authValidation } from "./auth.validation";

const router = express.Router();


// Login route
router.post(
  "/login",
  validateRequest(authValidation.loginValidationSchema),
  AuthController.loginUser
);

// Logout route
router.post("/logout", AuthController.logoutUser);

// Get profile route
router.get(
  "/profile",
  auth(UserRole.ADMIN, UserRole.USER),
  AuthController.getMyProfile
);

// Change password route
router.put(
  "/change-password",
  auth(),
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

// Forgot password route
router.post(
  "/forgot-password",
  validateRequest(authValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword
);

// Resend OTP route
router.post(
  "/resend-otp",
  validateRequest(authValidation.resendOtpValidationSchema),
  AuthController.resendOtp
);

// Verify OTP route
router.post(
  "/verify-otp",
  validateRequest(authValidation.verifyOtpValidationSchema),
  AuthController.verifyForgotPasswordOtp
);

// Reset password route
router.post(
  "/reset-password",
  auth(),
  validateRequest(authValidation.resetPasswordValidationSchema),
  AuthController.resetPassword
);

export const AuthRoutes = router;
