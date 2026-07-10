import express from "express";

import {
  getSparkQuestFest,
  createOrUpdateSparkQuestFest,
  deleteSparkQuestFest,
} from "../../controllers/life-at-tih/sparkQuestFestController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Spark Quest Fest
router.get(
  "/",
  getSparkQuestFest
);

/* ==========================================================
   ADMIN AUTHENTICATION
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================
   SPARK QUEST FEST
========================================================== */

// Create / Update (Single Document CMS)
router.put(
  "/",
  uploadImage.any(),
  createOrUpdateSparkQuestFest
);

// Delete
router.delete(
  "/",
  deleteSparkQuestFest
);

export default router;