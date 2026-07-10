import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadMixed from "../../middleware/bridge/uploadMixed.js";

import {
  getLibrary,
  createOrUpdateLibrary,
  deleteLibrary,
} from "../../controllers/facilities/libraryController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Library
router.get(
  "/",
  getLibrary
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update Library (Single Document CMS)
router.post(
  "/",
  authMiddleware,
  uploadMixed.fields([
    {
      name: "sideImage",
      maxCount: 1,
    },
    {
      name: "teacherAvatar",
      maxCount: 20,
    },
    {
      name: "ebookPdf",
      maxCount: 20,
    },
  ]),
  createOrUpdateLibrary
);

// Delete Library
router.delete(
  "/",
  authMiddleware,
  deleteLibrary
);

export default router;