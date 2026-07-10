import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";

import {
  getHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../../controllers/academics/holidayController.js";

const router = express.Router();

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get all holidays
router.get(
  "/",
  getHolidays
);

// Get single holiday
router.get(
  "/:id",
  getHolidayById
);

/* ==========================================================
   ADMIN ROUTES
========================================================== */

// Create holiday
router.post(
  "/",
  authMiddleware,
  createHoliday
);

// Update holiday
router.put(
  "/:id",
  authMiddleware,
  updateHoliday
);

// Delete holiday
router.delete(
  "/:id",
  authMiddleware,
  deleteHoliday
);

export default router;