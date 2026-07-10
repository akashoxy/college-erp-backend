import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import {
  createVisionMission,
  getVisionMission,
  updateVisionMission,
  deleteVisionMission,
} from "../../controllers/home-page/visionMissionController.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

router.get(
  "/",
  getVisionMission
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createVisionMission
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateVisionMission
);

router.delete(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  deleteVisionMission
);

export default router;