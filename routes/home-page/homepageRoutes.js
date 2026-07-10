import express from "express";

import {
  getHomepage,
  createOrUpdateHomepage,
  updateHomepage,
  uploadSliderImage,
} from "../../controllers/home-page/homepageController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

router.get("/", getHomepage);

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

// Create / Update Homepage
router.post(
  "/",
  createOrUpdateHomepage
);

// Update Homepage By ID
router.put(
  "/:id",
  updateHomepage
);

// Upload Slider Image
router.post(
  "/upload-slider",
  uploadImage.single("image"),
  uploadSliderImage
);

export default router;