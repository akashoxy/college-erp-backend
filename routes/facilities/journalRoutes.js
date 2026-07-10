import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadMixed from "../../middleware/bridge/uploadMixed.js";

import {
  getJournal,
  createOrUpdateJournal,
  addPublication,
  updatePublication,
  deletePublication,
  deleteJournal,
} from "../../controllers/facilities/journalController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

router.get(
  "/",
  getJournal
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update Journal (Single Document CMS)
router.post(
  "/",
  authMiddleware,
  uploadMixed.fields([
    {
      name: "bannerImage",
      maxCount: 1,
    },
    {
      name: "sideImage",
      maxCount: 1,
    },
  ]),
  createOrUpdateJournal
);

/* ==========================================================
   RESEARCH PUBLICATIONS
========================================================== */

// Add Publication
router.post(
  "/publication",
  authMiddleware,
  uploadMixed.fields([
    {
      name: "pdfFile",
      maxCount: 1,
    },
  ]),
  addPublication
);

// Update Publication
router.put(
  "/publication/:publicationId",
  authMiddleware,
  uploadMixed.fields([
    {
      name: "pdfFile",
      maxCount: 1,
    },
  ]),
  updatePublication
);

// Delete Publication
router.delete(
  "/publication/:publicationId",
  authMiddleware,
  deletePublication
);

/* ==========================================================
   DELETE JOURNAL CMS
========================================================== */

// Delete Entire Journal CMS
router.delete(
  "/",
  authMiddleware,
  deleteJournal
);

export default router;