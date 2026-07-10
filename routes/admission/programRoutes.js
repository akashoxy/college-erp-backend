import express from "express";

import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../controllers/admission/programController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all programs
router.get(
  "/",
  getPrograms
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

// Create program
router.post(
  "/",
  createProgram
);

// Update program
router.put(
  "/:id",
  updateProgram
);

// Delete program
router.delete(
  "/:id",
  deleteProgram
);

export default router;