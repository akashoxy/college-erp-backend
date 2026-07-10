import express from "express";

import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../../controllers/campus-tour/placedStudentController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   UPLOAD CONFIGURATION
========================================================== */

const studentImage =
  uploadImage.single("image");

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all placed students
router.get(
  "/",
  getStudents
);

// Get placed student by ID
router.get(
  "/:id",
  getStudentById
);

/* ==========================================================
   ADMIN AUTHENTICATION
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create placed student
router.post(
  "/",
  studentImage,
  createStudent
);

// Update placed student
router.put(
  "/:id",
  studentImage,
  updateStudent
);

// Delete placed student
router.delete(
  "/:id",
  deleteStudent
);

export default router;