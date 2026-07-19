import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import {
  getAlertRecipients,
  sendPaymentAlert,
  getMyNotifications,
  markNotificationRead,
} from "../../controllers/student/Notificationcontroller.js";

const router = express.Router();

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

// LIST DEFAULTERS OR ALL STUDENTS (?mode=defaulters|all)
router.get(
  "/admin/recipients",
  authMiddleware,
  roleMiddleware("admin"),
  getAlertRecipients
);

// SEND ALERT (IN-APP + EMAIL) TO SELECTED STUDENTS
router.post(
  "/admin/send",
  authMiddleware,
  roleMiddleware("admin"),
  sendPaymentAlert
);

/* ==========================================================================
   STUDENT ROUTES
============================================================================= */

// GET MY OWN NOTIFICATIONS
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("student"),
  getMyNotifications
);

// MARK A NOTIFICATION AS READ
router.patch(
  "/:id/read",
  authMiddleware,
  roleMiddleware("student"),
  markNotificationRead
);

export default router;