import express from "express";

import {
  createRecruiter,
  getRecruiters,
  getRecruiterById,
  updateRecruiter,
  deleteRecruiter,
} from "../../controllers/campus-tour/recruiterController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   UPLOAD CONFIGURATION
========================================================== */

const recruiterLogo =
  uploadImage.single("logo");

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all recruiters
router.get(
  "/",
  getRecruiters
);

// Get recruiter by ID
router.get(
  "/:id",
  getRecruiterById
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

// Create recruiter
router.post(
  "/",
  recruiterLogo,
  createRecruiter
);

// Update recruiter
router.put(
  "/:id",
  recruiterLogo,
  updateRecruiter
);

// Delete recruiter
router.delete(
  "/:id",
  deleteRecruiter
);

export default router;