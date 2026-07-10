import express from "express";

import {
  createProcedure,
  getProcedures,
  updateProcedure,
  deleteProcedure,
  uploadProcedureImage,
  uploadProcedureImageMiddleware,
} from "../../controllers/admission/admissionProcedureController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all admission procedures
router.get(
  "/",
  getProcedures
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

// Create admission procedure
router.post(
  "/",
  createProcedure
);

// Update admission procedure
router.put(
  "/:id",
  updateProcedure
);

// Delete admission procedure
router.delete(
  "/:id",
  deleteProcedure
);

// Upload program card image
router.post(
  "/upload-image",
  uploadProcedureImageMiddleware,
  uploadProcedureImage
);

export default router;