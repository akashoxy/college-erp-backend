import express from "express";

import {
  getFeeStructures,
  getFeeStructureByStream,
  createOrUpdateFeeStructure,
  deleteFeeStructure,
} from "../../controllers/admission/feeStructureController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadPdf from "../../middleware/bridge/uploadPdf.js";

const router = express.Router();

/* ==========================================================
   UPLOAD CONFIGURATION
========================================================== */

const feeStructureUpload =
  uploadPdf.single("pdfFile");

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all fee structures
router.get(
  "/",
  getFeeStructures
);

// Get fee structure by stream
router.get(
  "/:stream",
  getFeeStructureByStream
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

// Create Fee Structure
router.post(
  "/",
  feeStructureUpload,
  createOrUpdateFeeStructure
);

// Update Fee Structure
router.put(
  "/:id",
  feeStructureUpload,
  createOrUpdateFeeStructure
);

// Delete Fee Structure
router.delete(
  "/:id",
  deleteFeeStructure
);

export default router;