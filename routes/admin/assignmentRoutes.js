import express from "express";

import auth from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import {
  assignFaculty,
  getAssignments,
  reassignFaculty,
  deactivateAssignment,
  getFacultyAssignments,
} from "../../controllers/admin/facultySubjectAssignmentController.js";

const router = express.Router();

router.get(
  "/",
  auth,
  roleMiddleware("admin"),
  getAssignments
);
router.get(
  "/faculty/:facultyId",
  auth,
  roleMiddleware("admin"),
  getFacultyAssignments
);

router.post(
  "/",
  auth,
  roleMiddleware("admin"),
  assignFaculty
);

router.put(
  "/:subjectId",
  auth,
  roleMiddleware("admin"),
  reassignFaculty
);

router.delete(
  "/:id",
  auth,
  roleMiddleware("admin"),
  deactivateAssignment
);

export default router;