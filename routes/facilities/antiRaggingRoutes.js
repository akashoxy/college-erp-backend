import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadMixed from "../../middleware/bridge/uploadMixed.js";

import {
  saveAntiRagging,
  getAntiRagging,
  deleteAntiRagging,
} from "../../controllers/facilities/antiRaggingController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Anti Ragging CMS
router.get(
  "/",
  getAntiRagging
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update (Single Document CMS)
router.post(
  "/",
  authMiddleware,
  uploadMixed.any(),
  saveAntiRagging
);

// Delete CMS
router.delete(
  "/",
  authMiddleware,
  deleteAntiRagging
);

export default router;