import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  saveJeca,
  getJeca,
  deleteJeca,
} from "../../controllers/facilities/jecaController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get JECA
router.get(
  "/",
  getJeca
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update JECA
router.post(
  "/",
  authMiddleware,
  uploadImage.single("bannerImage"),
  saveJeca
);

// Delete JECA
router.delete(
  "/",
  authMiddleware,
  deleteJeca
);

export default router;