import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";
import uploadPdf from "../../middleware/bridge/uploadPdf.js";

import {
  getSyllabus,
  createOrUpdateSyllabus,
  deleteSyllabus,
  getStreamSyllabus,
} from "../../controllers/student/syllabusController.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

router.get(
  "/",
  getSyllabus
);

router.get(
  "/stream/:stream",
  getStreamSyllabus
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploadPdf.single("pdf"),
  createOrUpdateSyllabus
);

router.put(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  uploadPdf.single("pdf"),
  createOrUpdateSyllabus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSyllabus
);

export default router;