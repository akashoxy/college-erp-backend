import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";

import Payment from "../../models/student/Payment.js";
import Student from "../../models/student/Student.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   RAZORPAY INSTANCE
============================================================================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* ==========================================================================
   CREATE ORDER
============================================================================= */

export const createOrder = async (
  req,
  res
) => {

  try {

    /* =====================================================
       ONLY THE PURPOSE + AMOUNT COME FROM THE STUDENT.
       Everything else (name, email, phone, stream, semester,
       studentId) is derived server-side from the logged-in
       student's own record — never trust the client for this.
    ====================================================== */

    const {

      paymentPurpose,
      amount

    } = req.body;

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (

      !paymentPurpose ||
      !amount

    ) {

      return errorResponse(

        res,

        "Payment purpose and amount are required.",

        400

      );

    }

    const numericAmount =
      Number(amount);

    if (

      Number.isNaN(
        numericAmount
      ) ||

      numericAmount <= 0

    ) {

      return errorResponse(

        res,

        "Invalid payment amount.",

        400

      );

    }

    const student = await Student.findById(req.user.id);

    if (!student) {

      return errorResponse(

        res,

        "Student not found.",

        404

      );

    }

    /* =====================================================
       DUPLICATE PENDING PAYMENT CHECK
    ====================================================== */

    const existingPayment =
      await Payment.findOne({

        studentId: student._id.toString(),

        paymentPurpose,

        paymentStatus:
          "Pending",

      });

    if (existingPayment) {

      return errorResponse(

        res,

        "A pending payment already exists for this payment purpose.",

        409

      );

    }

    /* =====================================================
       CREATE RAZORPAY ORDER
    ====================================================== */

    const receiptNumber =
      `receipt_${Date.now()}`;

    const order =
      await razorpay.orders.create({

        amount:
          numericAmount * 100,

        currency:
          "INR",

        receipt:
          receiptNumber,

      });

    /* =====================================================
       SAVE PAYMENT
    ====================================================== */

    const payment =
      await Payment.create({

        studentName: student.name,

        studentId: student._id.toString(),

        email: student.email,

        phone: student.phone,

        stream: student.stream,

        semester: String(student.semester),

        paymentPurpose,

        amount:
          numericAmount,

        razorpayOrderId:
          order.id,

        receiptNumber,

        paymentMethod:
          "Razorpay",

        paymentStatus:
          "Pending",

      });

    return successResponse(

      res,

      "Payment order created successfully.",

      {

        order,

        payment,

        amount:
          order.amount,

        key:
          process.env
            .RAZORPAY_KEY_ID,

      },

      200

    );

  } catch (error) {

    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return errorResponse(

      res,

      "Failed to create payment order.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   VERIFY PAYMENT
============================================================================= */

export const verifyPayment = async (
  req,
  res
) => {

  try {

    const {

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

    } = req.body;

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (

      !razorpay_order_id ||

      !razorpay_payment_id ||

      !razorpay_signature

    ) {

      return errorResponse(

        res,

        "Payment verification data is missing.",

        400

      );

    }

    /* =====================================================
       FIND PAYMENT
    ====================================================== */

    const payment =
      await Payment.findOne({

        razorpayOrderId:
          razorpay_order_id,

      });

    if (!payment) {

      return errorResponse(

        res,

        "Payment record not found.",

        404

      );

    }

    /* =====================================================
       ALREADY VERIFIED
    ====================================================== */

    if (

      payment.paymentStatus ===
      "Success"

    ) {

      return successResponse(

        res,

        "Payment already verified.",

        payment

      );

    }

    /* =====================================================
       GENERATE SIGNATURE
    ====================================================== */

    const expectedSignature =
      crypto

        .createHmac(

          "sha256",

          process.env
            .RAZORPAY_SECRET

        )

        .update(

          `${razorpay_order_id}|${razorpay_payment_id}`

        )

        .digest("hex");

    /* =====================================================
       VERIFY SIGNATURE
    ====================================================== */

    if (

      expectedSignature !==
      razorpay_signature

    ) {

      payment.paymentStatus =
        "Failed";

      await payment.save();

      return errorResponse(

        res,

        "Payment verification failed.",

        400

      );

    }

    /* =====================================================
       UPDATE PAYMENT
    ====================================================== */

    payment.razorpayPaymentId =
      razorpay_payment_id;

    payment.razorpaySignature =
      razorpay_signature;

    payment.transactionId =
      razorpay_payment_id;

    payment.paymentMethod =
      "Razorpay";

    payment.paymentStatus =
      "Success";

    await payment.save();

    /* =====================================================
       SUCCESS
    ====================================================== */

    return successResponse(

      res,

      "Payment verified successfully.",

      payment

    );

  } catch (error) {

    console.error(

      "VERIFY PAYMENT ERROR:",

      error

    );

    return errorResponse(

      res,

      "Payment verification failed.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   GET ALL PAYMENTS
============================================================================= */

export const getAllPayments = async (
  req,
  res
) => {

  try {

    const {

      page = 1,
      limit = 20,
      paymentStatus,
      paymentPurpose,
      search,

    } = req.query;

    const query = {};

    /* =====================================================
       FILTERS
    ====================================================== */

    if (paymentStatus) {

      query.paymentStatus =
        paymentStatus;

    }

    if (paymentPurpose) {

      query.paymentPurpose =
        paymentPurpose;

    }

    if (search) {

      query.$or = [

        {

          studentName: {

            $regex: search,

            $options: "i",

          },

        },

        {

          studentId: {

            $regex: search,

            $options: "i",

          },

        },

        {

          email: {

            $regex: search,

            $options: "i",

          },

        },

      ];

    }

    /* =====================================================
       PAGINATION
    ====================================================== */

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const [

      payments,

      total,

    ] = await Promise.all([

      Payment.find(query)

        .sort({

          createdAt: -1,

        })

        .skip(skip)

        .limit(Number(limit)),

      Payment.countDocuments(
        query
      ),

    ]);

    return successResponse(

      res,

      "Payments fetched successfully.",

      {

        payments,

        pagination: {

          total,

          page:
            Number(page),

          limit:
            Number(limit),

          totalPages:
            Math.ceil(
              total /
                Number(limit)
            ),

        },

      }

    );

  } catch (error) {

    console.error(

      "GET PAYMENTS ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to fetch payments.",

      500,

      error.message

    );

  }

};

/* ==========================================================================
   GET LOGGED-IN STUDENT'S OWN DETAILS (for auto-filling the fees form)
============================================================================= */

export const getMyDetails = async (
  req,
  res
) => {

  try {

    const student =
      await Student.findById(
        req.user.id
      )
        .select("-password")
        .lean();

    if (!student) {

      return errorResponse(

        res,

        "Student not found.",

        404

      );

    }

    return successResponse(

      res,

      "Student details fetched successfully.",

      { student }

    );

  } catch (error) {

    console.error(

      "GET MY DETAILS ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to fetch student details.",

      500,

      error.message

    );

  }

};

/* ==========================================================================
   GET STUDENT PAYMENT DATA
============================================================================= */

export const getStudentData = async (
  req,
  res
) => {

  try {

    const {

      studentId,

    } = req.params;

    if (!studentId) {

      return errorResponse(

        res,

        "Student ID is required.",

        400

      );

    }

    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {

      return errorResponse(

        res,

        "Invalid student ID.",

        400

      );

    }

    /* =====================================================
       FETCH THE ACTUAL STUDENT PROFILE
    ====================================================== */

    const student =
      await Student.findById(
        studentId
      )
        .select("-password")
        .lean();

    if (!student) {

      return errorResponse(

        res,

        "Student not found.",

        404

      );

    }

    /* =====================================================
       FETCH THEIR PAYMENT HISTORY
       (a valid student with no payments yet is not an error)
    ====================================================== */

    const payments =
      await Payment.find({

        studentId,

      }).sort({

        createdAt: -1,

      });

    return successResponse(

      res,

      "Student payment records fetched successfully.",

      {

        student,

        payments,

      }

    );

  } catch (error) {

    console.error(

      "GET STUDENT PAYMENT ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to fetch student payment data.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   GET PAYMENT STATUS
============================================================================= */

export const getPaymentStatus = async (
  req,
  res
) => {
  try {

    const { orderId } =
      req.params;

    if (!orderId) {

      return errorResponse(
        res,
        "Order ID is required.",
        400
      );

    }

    const payment =
      await Payment.findOne({
        razorpayOrderId:
          orderId,
      });

    if (!payment) {

      return errorResponse(
        res,
        "Payment not found.",
        404
      );

    }

    return successResponse(
      res,
      "Payment fetched successfully.",
      payment
    );

  } catch (error) {

    console.error(
      "GET PAYMENT STATUS ERROR:",
      error
    );

    return errorResponse(
      res,
      "Failed to fetch payment status.",
      500,
      error.message
    );

  }
};

/* ==========================================================================
   DELETE PAYMENT
============================================================================= */

export const deletePayment = async (
  req,
  res
) => {
  try {

    const payment =
      await Payment.findById(
        req.params.id
      );

    if (!payment) {

      return errorResponse(
        res,
        "Payment not found.",
        404
      );

    }

    await payment.deleteOne();

    return successResponse(
      res,
      "Payment deleted successfully."
    );

  } catch (error) {

    console.error(
      "DELETE PAYMENT ERROR:",
      error
    );

    return errorResponse(
      res,
      "Failed to delete payment.",
      500,
      error.message
    );

  }
};