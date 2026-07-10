import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  createOrUpdateBba,
  getBba,
  removeBbaImage,
  deleteBba,
} from "../../controllers/academics/bbaController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get BBA Information
router.get(
  "/",
  getBba
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update BBA
router.post(
  "/add",
  authMiddleware,
  uploadImage.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createOrUpdateBba
);

// Remove only the banner image
router.delete(
  "/image",
  authMiddleware,
  removeBbaImage
);

// Delete the entire BBA CMS
router.delete(
  "/delete",
  authMiddleware,
  deleteBba
);

export default router;