import express from "express";
import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadImage from "../../middleware/bridge/uploadImage.js";

import {
  getCommonRoom,
  createOrUpdateCommonRoom,
  addGame,
  updateGame,
  deleteGame,
  deleteHeroImage,
  deleteCommonRoom,
} from "../../controllers/facilities/commonRoomController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

router.get(
  "/",
  getCommonRoom
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update Common Room (Single Document CMS)
router.post(
  "/",
  authMiddleware,
  uploadImage.any(),
  createOrUpdateCommonRoom
);

/* ==========================================================
   GAMES CRUD
========================================================== */

// Add Game
router.post(
  "/games",
  authMiddleware,
  uploadImage.any(),
  addGame
);

// Update Game
router.put(
  "/games/:id",
  authMiddleware,
  uploadImage.any(),
  updateGame
);

// Delete Game
router.delete(
  "/games/:id",
  authMiddleware,
  deleteGame
);

/* ==========================================================
   HERO IMAGE
========================================================== */

// Delete Hero Image
router.delete(
  "/hero-image",
  authMiddleware,
  deleteHeroImage
);

router.delete(
    "/",
    authMiddleware,
    deleteCommonRoom
);

export default router;