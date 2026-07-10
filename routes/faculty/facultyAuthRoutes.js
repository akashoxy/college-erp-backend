import express from "express";

import {
  registerFaculty,
  loginFaculty,
  forgotPassword,
  resetPassword,
  getFacultyProfile,
  updateFacultyProfile,
  getAllFaculty,
} from "../../controllers/faculty/facultyAuthController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

router.post(
  "/register",
  registerFaculty
);

router.post(
  "/login",
  loginFaculty
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
   FACULTY ROUTES
============================================================================= */

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(
    "faculty",
    "admin"
  ),
  getFacultyProfile
);

router.put(
  "/update-profile",
  authMiddleware,
  roleMiddleware(
    "faculty",
    "admin"
  ),
  uploadImage.single("photo"),
  updateFacultyProfile
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllFaculty
);

export default router;