import express from "express";

import {
  getVerbena,
  createOrUpdateVerbena,
  deleteVerbena,
  uploadVerbenaImage,
  uploadVerbenaImageMiddleware,
} from "../../controllers/life-at-tih/verbenaController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Verbena
router.get(
  "/",
  getVerbena
);

/* ==========================================================
   ADMIN AUTHENTICATION
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================
   VERBENA
========================================================== */

// Create (Single Document CMS)
router.post(
  "/",
  createOrUpdateVerbena
);

// Update
router.put(
  "/",
  createOrUpdateVerbena
);

// Delete
router.delete(
  "/",
  deleteVerbena
);

// Upload Image (Hero / About / Category / Highlight)
router.post(
  "/upload-image",
  uploadVerbenaImageMiddleware,
  uploadVerbenaImage
);

export default router;