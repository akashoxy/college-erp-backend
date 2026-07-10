import express from "express";

import {
  createOrUpdateVideoGallery,
  getVideoGallery,
  deleteVideoGallery,
} from "../../controllers/campus-tour/videogalleryController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Video Gallery
router.get(
  "/",
  getVideoGallery
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

// Create Video Gallery
router.post(
  "/",
  createOrUpdateVideoGallery
);

// Update Video Gallery
router.put(
  "/",
  createOrUpdateVideoGallery
);

// Delete Video Gallery
router.delete(
  "/",
  deleteVideoGallery
);

export default router;