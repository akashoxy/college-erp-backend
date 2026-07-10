import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  getFacultyMembers,
  getFacultyMemberById,
  getFeaturedFaculty,
  createFacultyMember,
  updateFacultyMember,
  removeFacultyPhoto,
  deleteFacultyMember,
} from "../../controllers/academics/facultyResearchController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all faculty members
router.get(
  "/",
  getFacultyMembers
);

// Get featured faculty
router.get(
  "/featured",
  getFeaturedFaculty
);

// Get single faculty member
router.get(
  "/:id",
  getFacultyMemberById
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create faculty member
router.post(
  "/",
  authMiddleware,
  uploadImage.single("photo"),
  createFacultyMember
);

// Update faculty member
router.put(
  "/:id",
  authMiddleware,
  uploadImage.single("photo"),
  updateFacultyMember
);

// Remove only faculty photo
router.delete(
  "/:id/photo",
  authMiddleware,
  removeFacultyPhoto
);

// Delete faculty member
router.delete(
  "/:id",
  authMiddleware,
  deleteFacultyMember
);

export default router;