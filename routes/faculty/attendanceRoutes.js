import express from "express";

import {
  getFacultySubjects,
  loadStudents,
  saveAttendance,
  getStudentAttendance,
  getAttendancePercentage,
  getSubjectAttendance,
  getAttendanceByDate,
  getAttendanceReport,
  getReportSummary,
  getLowAttendanceStudents,
} from "../../controllers/faculty/attendanceController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================================
   FACULTY ROUTES
============================================================================= */

router.get(
  "/faculty-subjects",
  authMiddleware,
  roleMiddleware("faculty"),
  getFacultySubjects
);

router.get(
  "/students",
  authMiddleware,
  roleMiddleware("faculty"),
  loadStudents
);

router.post(
  "/save",
  authMiddleware,
  roleMiddleware("faculty"),
  saveAttendance
);

/* ==========================================================================
   STUDENT ROUTES
============================================================================= */

router.get(
  "/student/:id",
  authMiddleware,
  getStudentAttendance
);

router.get(
  "/percentage/:id",
  authMiddleware,
  getAttendancePercentage
);

router.get(
  "/subject/:subjectId",
  authMiddleware,
  getSubjectAttendance
);

router.get(
  "/date",
  authMiddleware,
  getAttendanceByDate
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.get(
  "/report",
  authMiddleware,
  roleMiddleware("admin"),
  getAttendanceReport
);

router.get(
  "/report-summary",
  authMiddleware,
  roleMiddleware("admin"),
  getReportSummary
);

router.get(
  "/low-attendance",
  authMiddleware,
  roleMiddleware("admin"),
  getLowAttendanceStudents
);

export default router;