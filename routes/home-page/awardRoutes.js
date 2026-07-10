import express from "express";

import {
  createAward,
  getAwards,
  getAwardById,
  updateAward,
  deleteAward,
  deleteAllAwards,
} from "../../controllers/home-page/awardController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

router.get("/", getAwards);

router.get("/:id", getAwardById);

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

// Create Award
router.post(
  "/",
  uploadImage.single("image"),
  createAward
);

// Update Award
router.put(
  "/:id",
  uploadImage.single("image"),
  updateAward
);

// Delete Award
router.delete(
  "/:id",
  deleteAward
);

// Delete All Awards
router.delete(
  "/",
  deleteAllAwards
);

export default router;