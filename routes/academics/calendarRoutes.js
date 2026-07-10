import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import uploadMixed from "../../middleware/bridge/uploadMixed.js";

import {
  saveAcademicCalendar,
  getAcademicCalendar,
  removeAcademicCalendarFile,
  deleteAcademicCalendar,
} from "../../controllers/academics/academicCalendarController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Academic Calendar
router.get("/", getAcademicCalendar);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create / Update Academic Calendar
router.post(
  "/add",
  authMiddleware,
  uploadMixed.single("file"),
  saveAcademicCalendar
);

// Remove only the uploaded file (keeps document)
router.delete(
  "/file",
  authMiddleware,
  removeAcademicCalendarFile
);

// Delete the entire Academic Calendar CMS document
router.delete(
  "/",
  authMiddleware,
  deleteAcademicCalendar
);

export default router;