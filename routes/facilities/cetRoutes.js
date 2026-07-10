import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  saveCet,
  getCet,
  deleteCet,
} from "../../controllers/facilities/cetController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get CET Content
router.get(
  "/",
  getCet
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update CET Content
router.post(
  "/",
  authMiddleware,
  uploadImage.single("bannerImage"),
  saveCet
);

// Delete CET Content
router.delete(
  "/",
  authMiddleware,
  deleteCet
);

export default router;