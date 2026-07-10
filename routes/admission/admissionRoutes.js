import express from "express";

import {
  createAdmission,
  getAdmissions,
  deleteAdmission,
  updateAdmissionStatus,
} from "../../controllers/admission/admissionController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Submit admission enquiry
router.post("/", createAdmission);

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

// Get all enquiries
router.get("/", getAdmissions);

// Update enquiry status
router.put(
  "/:id/status",
  updateAdmissionStatus
);

// Delete enquiry
router.delete(
  "/:id",
  deleteAdmission
);

export default router;