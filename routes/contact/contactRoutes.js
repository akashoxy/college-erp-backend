import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../../controllers/contact/contactController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Submit Contact Enquiry
router.post(
  "/",
  createEnquiry
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

// Get All Enquiries
router.get(
  "/",
  getEnquiries
);

// Get Single Enquiry
router.get(
  "/:id",
  getEnquiryById
);

// Update Enquiry Status
router.patch(
  "/:id/status",
  updateEnquiryStatus
);

// Delete Enquiry
router.delete(
  "/:id",
  deleteEnquiry
);

export default router;