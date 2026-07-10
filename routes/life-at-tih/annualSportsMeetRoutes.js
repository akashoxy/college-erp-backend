import express from "express";

import {
  getAnnualSportsMeet,
  createOrUpdateAnnualSportsMeet,
  deleteAnnualSportsMeet,

  addSportsEvent,
  updateSportsEvent,
  deleteSportsEvent,

  addAchievement,
  updateAchievement,
  deleteAchievement,
} from "../../controllers/life-at-tih/annualSportsMeetController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   PUBLIC
========================================================== */

router.get(
  "/",
  getAnnualSportsMeet
);

/* ==========================================================
   ADMIN
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================
   PAGE
========================================================== */

router.put(
  "/",
  uploadImage.single("heroImage"),
  createOrUpdateAnnualSportsMeet
);

router.delete(
  "/",
  deleteAnnualSportsMeet
);

/* ==========================================================
   SPORTS EVENTS
========================================================== */

router.post(
  "/events",
  uploadImage.single("image"),
  addSportsEvent
);

router.put(
  "/events/:id",
  uploadImage.single("image"),
  updateSportsEvent
);

router.delete(
  "/events/:id",
  deleteSportsEvent
);

/* ==========================================================
   ACHIEVEMENTS
========================================================== */

router.post(
  "/achievements",
  uploadImage.single("image"),
  addAchievement
);

router.put(
  "/achievements/:id",
  uploadImage.single("image"),
  updateAchievement
);

router.delete(
  "/achievements/:id",
  deleteAchievement
);

export default router;