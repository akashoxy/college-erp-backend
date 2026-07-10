import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  createOrUpdateMca,
  getMca,
  removeMcaImage,
  deleteMca,
} from "../../controllers/academics/mcaController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get MCA Information
router.get(
  "/",
  getMca
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update MCA
router.post(
  "/add",
  authMiddleware,
  uploadImage.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  createOrUpdateMca
);

// Remove only the banner image
router.delete(
  "/image",
  authMiddleware,
  removeMcaImage
);

// Delete the entire MCA CMS
router.delete(
  "/delete",
  authMiddleware,
  deleteMca
);

export default router;