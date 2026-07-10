import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import uploadPdf from "../../middleware/bridge/uploadPdf.js";

import {
  createPaper,
  getAllPapers,
  getPaperById,
  updatePaper,
  deletePaper,
  searchPapers,
  filterPapers,
} from "../../controllers/student/previousQuestionController.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

router.get(
  "/",
  getAllPapers
);

router.get(
  "/search",
  searchPapers
);

router.get(
  "/filter",
  filterPapers
);

router.get(
  "/:id",
  getPaperById
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploadPdf.single("pdfFile"),
  createPaper
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  uploadPdf.single("pdfFile"),
  updatePaper
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deletePaper
);

export default router;