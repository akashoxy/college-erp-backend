import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  createOrUpdateBca,
  getBca,
  removeBcaImage,
  deleteBca,
} from "../../controllers/academics/bcaController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get BCA Information
router.get(
  "/",
  getBca
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update BCA
router.post(
  "/add",
  authMiddleware,
  uploadImage.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createOrUpdateBca
);

// Remove only the banner image
router.delete(
  "/image",
  authMiddleware,
  removeBcaImage
);

// Delete the entire BCA CMS
router.delete(
  "/delete",
  authMiddleware,
  deleteBca
);

export default router;