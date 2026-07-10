import express from "express";

import {
  createFacultyNote,
  getAllFacultyNotes,
  getFacultyNoteById,
  updateFacultyNote,
  deleteFacultyNote,
  getMyFacultyNotes,
  getStudentNotes,
  searchFacultyNotes,
} from "../../controllers/faculty/facultyNoteController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import uploadPdf from "../../middleware/bridge/uploadPdf.js";

const router = express.Router();

/* ==========================================================================
   STUDENT ROUTES
============================================================================= */

router.get(
  "/student",
  authMiddleware,
  roleMiddleware("student"),
  getStudentNotes
);

/* ==========================================================================
   FACULTY ROUTES
============================================================================= */

router.get(
  "/my-notes",
  authMiddleware,
  roleMiddleware("faculty"),
  getMyFacultyNotes
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("faculty"),
  uploadPdf.single("pdfFile"),
  createFacultyNote
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty"),
  uploadPdf.single("pdfFile"),
  updateFacultyNote
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty"),
  deleteFacultyNote
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.get(
  "/",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  getAllFacultyNotes
);

router.get(
  "/search",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  searchFacultyNotes
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("faculty", "admin"),
  getFacultyNoteById
);

export default router;