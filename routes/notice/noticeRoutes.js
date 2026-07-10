import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadPdf from "../../middleware/bridge/uploadPdf.js";

import {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  getFeaturedNotice,
  getStudentNotices,
  getFacultyNotices,
} from "../../controllers/notice/noticeController.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
========================================================================== */

// Get All Notices
router.get(
  "/",
  getNotices
);

// Featured Notice
router.get(
  "/featured",
  getFeaturedNotice
);

// Student Notices
router.get(
  "/student",
  getStudentNotices
);

// Faculty Notices
router.get(
  "/faculty",
  getFacultyNotices
);

// Get Notice By ID
router.get(
  "/:id",
  getNoticeById
);

/* ==========================================================================
   ADMIN AUTHENTICATION
========================================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================================
   ADMIN ROUTES
========================================================================== */

// Create Notice
router.post(
  "/",
  uploadPdf.single("pdfFile"),
  createNotice
);

// Update Notice
router.put(
  "/:id",
  uploadPdf.single("pdfFile"),
  updateNotice
);

// Delete Notice
router.delete(
  "/:id",
  deleteNotice
);

export default router;