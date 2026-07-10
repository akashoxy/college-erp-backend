import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  saveComputerLaboratory,
  getComputerLaboratory,
  deleteComputerLaboratory,
} from "../../controllers/facilities/computerLaboratoryController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Computer Laboratory
router.get(
  "/",
  getComputerLaboratory
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update (Single Document CMS)
router.post(
  "/",
  authMiddleware,
  uploadImage.any(),
  saveComputerLaboratory
);

// Delete Computer Laboratory
router.delete(
  "/",
  authMiddleware,
  deleteComputerLaboratory
);

export default router;