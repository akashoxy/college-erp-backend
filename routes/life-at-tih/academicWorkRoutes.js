import express from "express";

import {
  getAcademicWorks,
  getAcademicWork,
  createAcademicWork,
  updateAcademicWork,
  deleteAcademicWork,
  deleteAllAcademicWorks,
  toggleFeatured,
} from "../../controllers/life-at-tih/academicWorkController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadLibrary from "../../middleware/bridge/uploadLibrary.js";

const router = express.Router();

/* ==========================================================
   UPLOAD CONFIGURATION
========================================================== */

const academicWorkUpload =
  uploadLibrary.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "gallery",
      maxCount: 20,
    },
  ]);

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all academic works
router.get(
  "/",
  getAcademicWorks
);

// Get academic work by ID
router.get(
  "/:id",
  getAcademicWork
);

/* ==========================================================
   ADMIN AUTHENTICATION
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create academic work
router.post(
  "/",
  academicWorkUpload,
  createAcademicWork
);

// Update academic work
router.put(
  "/:id",
  academicWorkUpload,
  updateAcademicWork
);

// Toggle featured
router.patch(
  "/:id/featured",
  toggleFeatured
);

// Delete one
router.delete(
  "/:id",
  deleteAcademicWork
);

// Delete all
router.delete(
  "/",
  deleteAllAcademicWorks
);

export default router;