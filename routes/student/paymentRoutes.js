import express from "express";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import roleMiddleware from "../../middleware/auth/roleMiddleware.js";

import {
  createOrder,
  verifyPayment,
  getAllPayments,
  getMyDetails,
  getStudentData,
  getPaymentStatus,
  deletePayment,
} from "../../controllers/student/paymentController.js";

const router = express.Router();

/* ==========================================================================
   STUDENT ROUTES (require a logged-in student)
============================================================================= */

// GET MY OWN DETAILS — used to auto-fill the fees payment form
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("student"),
  getMyDetails
);

// CREATE PAYMENT ORDER
router.post(
    "/create-order",
    authMiddleware,
    roleMiddleware("student"),
    createOrder
);

// VERIFY PAYMENT
router.post(
    "/verify-payment",
    authMiddleware,
    roleMiddleware("student"),
    verifyPayment
);

/* ==========================================================================
   ADMIN-ONLY: LOOK UP ANY STUDENT'S PAYMENT HISTORY BY ID
   (this used to be public with no auth check — anyone could pull any
   student's payment history just by knowing/guessing their ID)
============================================================================= */

router.get(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware("admin"),
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