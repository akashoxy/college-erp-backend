import express from "express";

import {
  createApproval,
  getApprovals,
  getApprovalById,
  updateApproval,
  deleteApproval,
  deleteAllApprovals,
} from "../../controllers/home-page/approvalController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

router.get("/", getApprovals);

router.get("/:id", getApprovalById);

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

// Create Approval
router.post(
  "/",
  uploadImage.single("logo"),
  createApproval
);

// Update Approval
router.put(
  "/:id",
  uploadImage.single("logo"),
  updateApproval
);

// Delete Approval
router.delete(
  "/:id",
  deleteApproval
);

// Delete All Approvals
router.delete(
  "/",
  deleteAllApprovals
);

export default router;