import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";

import {
  registerStudent,
  loginStudent,
  forgotPassword,
  resetPassword,
  getStudentProfile,
  updateStudentProfile,
} from "../../controllers/student/studentAuthController.js";

const router = express.Router();

/* ==========================================================================
   AUTH ROUTES
============================================================================= */

router.post(
  "/register",
  registerStudent
);

router.post(
  "/login",
  loginStudent
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

/* ==========================================================================
   PROFILE ROUTES
============================================================================= */

router.get(
  "/profile",
  authMiddleware,
  getStudentProfile
);

router.put(
  "/profile",
  authMiddleware,
  updateStudentProfile
);

export default router;