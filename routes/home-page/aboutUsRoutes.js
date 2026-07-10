import express from "express";

import {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
  deleteAboutUs,
} from "../../controllers/home-page/aboutUsController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   UPLOAD CONFIGURATION
========================================================== */

const aboutUsUpload = uploadImage.fields([
  {
    name: "campusImage",
    maxCount: 1,
  },
  {
    name: "principalImage",
    maxCount: 1,
  },
]);

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

router.get("/", getAboutUs);

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

// Create About Us
router.post(
  "/",
  aboutUsUpload,
  createAboutUs
);

// Update About Us
router.put(
  "/",
  aboutUsUpload,
  updateAboutUs
);

// Delete About Us
router.delete(
  "/",
  deleteAboutUs
);

export default router;