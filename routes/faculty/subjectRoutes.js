import express from "express";

import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "../../controllers/faculty/subjectController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

router.get("/", getSubjects);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createSubject
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateSubject
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSubject
);

export default router;