import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import {
  createOrder,
  verifyPayment,
  getAllPayments,
  getStudentData,
  getPaymentStatus,
  deletePayment,
} from "../../controllers/student/paymentController.js";

const router = express.Router();

/* ==========================================================================
   PUBLIC ROUTES
============================================================================= */

// CREATE PAYMENT ORDER
router.post(
  "/create-order",
  createOrder
);

// VERIFY PAYMENT
router.post(
  "/verify-payment",
  verifyPayment
);

// GET STUDENT PAYMENT HISTORY
router.get(
  "/student/:studentId",
  getStudentData
);

/* ==========================================================================
   ADMIN ROUTES
============================================================================= */

// GET ALL PAYMENTS
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllPayments
);

// GET PAYMENT STATUS
router.get(
  "/status/:orderId",
  authMiddleware,
  roleMiddleware("admin"),
  getPaymentStatus
);

// DELETE PAYMENT
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deletePayment
);

export default router;