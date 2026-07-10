import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";

import {
  getRadioTih,
  createOrUpdateRadioTih,
  deleteRadioTih,
} from "../../controllers/facilities/radioTihController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Radio TIH Content
router.get(
  "/",
  getRadioTih
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update Radio TIH
router.post(
  "/",
  authMiddleware,
  createOrUpdateRadioTih
);

// Delete Radio TIH
router.delete(
  "/",
  authMiddleware,
  deleteRadioTih
);

export default router;