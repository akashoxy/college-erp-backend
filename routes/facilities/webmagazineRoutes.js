import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadMixed from "../../middleware/bridge/uploadMixed.js";

import {
  createMagazine,
  getMagazines,
  getMagazineById,
  updateMagazine,
  deleteMagazine,
} from "../../controllers/facilities/webMagazineController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get All Magazines
router.get(
  "/",
  getMagazines
);

// Get Single Magazine
router.get(
  "/:id",
  getMagazineById
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create Magazine
router.post(
  "/",
  authMiddleware,
  uploadMixed.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "pdfFile",
      maxCount: 1,
    },
  ]),
  createMagazine
);

// Update Magazine
router.put(
  "/:id",
  authMiddleware,
  uploadMixed.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "pdfFile",
      maxCount: 1,
    },
  ]),
  updateMagazine
);

// Delete Magazine
router.delete(
  "/:id",
  authMiddleware,
  deleteMagazine
);

export default router;