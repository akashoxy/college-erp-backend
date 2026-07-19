import mongoose from "mongoose";

import Notification from "../../models/student/Notification.js";
import Student from "../../models/student/Student.js";
import Payment from "../../models/student/Payment.js";

import { sendEmail } from "../../utils/Sendemail.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   HELPERS
============================================================================= */

function escapeRegex(str) {
  return str.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/* ==========================================================================
   ADMIN: LIST STUDENTS FOR AN ALERT
   mode=defaulters (default) -> only students with NO Success payment
     recorded for their CURRENT stream + semester + given purpose.
   mode=all -> every active student matching the stream/batch filters,
     regardless of payment status (for general, non-fee notices).
============================================================================= */

export const getAlertRecipients = async (
  req,
  res
) => {

  try {

    const {

      mode = "defaulters",
      paymentPurpose = "Semester Fees",
      stream,
      batch,

    } = req.query;

    const studentFilter = {
      status: "active",
    };

    if (stream) {
      studentFilter.stream = stream;
    }

    if (batch) {
      // Student.batch is auto-generated like "2026 - 2030",
      // so match it as a partial string, not an exact equal —
      // otherwise typing just "2026" would never match anything.
      studentFilter.batch = {
        $regex: escapeRegex(batch),
        $options: "i",
      };
    }

    const students = await Student.find(
      studentFilter
    )
      .select("-password")
      .sort({ name: 1 })
      .lean();

    if (mode === "all") {

      return successResponse(

        res,

        "Students fetched successfully.",

        {
          students,
          count: students.length,
          mode: "all",
        }

      );

    }

    /* =====================================================
       DEFAULTER MODE — cross-check against successful
       payments for each student's OWN current stream+semester
    ====================================================== */

    const paidPayments = await Payment.find({

      paymentPurpose: {
        $regex: `^${escapeRegex(paymentPurpose)}$`,
        $options: "i",
      },

      paymentStatus: "Success",

    })
      .select("studentId stream semester")
      .lean();

    const paidSet = new Set(
      paidPayments.map(
        (p) =>
          `${p.studentId}|${p.stream}|${p.semester}`
      )
    );

    const defaulters = students.filter(

      (s) =>
        !paidSet.has(
          `${s._id.toString()}|${s.stream}|${String(s.semester)}`
        )

    );

    return successResponse(

      res,

      "Fee defaulters fetched successfully.",

      {
        students: defaulters,
        count: defaulters.length,
        mode: "defaulters",
        paymentPurpose,
      }

    );

  } catch (error) {

    console.error(
      "GET ALERT RECIPIENTS ERROR:",
      error
    );

    return errorResponse(

      res,

      "Failed to fetch students for alert.",

      500,

      error.message

    );

  }

};

/* ==========================================================================
   ADMIN: SEND ALERT TO SELECTED STUDENTS
   Creates an in-app notification for each student AND emails them.
   Email failures are best-effort — they don't block the in-app side
   or fail the whole request.
============================================================================= */

export const sendPaymentAlert = async (
  req,
  res
) => {

  try {

    const {

      studentIds,
      title,
      message,
      type = "payment-alert",
      relatedPaymentPurpose = "",

    } = req.body;

    if (

      !Array.isArray(studentIds) ||
      studentIds.length === 0

    ) {

      return errorResponse(

        res,

        "Select at least one student.",

        400

      );

    }

    if (!title || !message) {

      return errorResponse(

        res,

        "Title and message are required.",

        400

      );

    }

    const validIds = studentIds.filter(

      (id) =>
        mongoose.Types.ObjectId.isValid(id)

    );

    if (validIds.length === 0) {

      return errorResponse(

        res,

        "No valid student IDs were provided.",

        400

      );

    }

    const students = await Student.find({

      _id: { $in: validIds },

    }).select("name email");

    if (students.length === 0) {

      return errorResponse(

        res,

        "No matching students found.",

        404

      );

    }

    /* =====================================================
       CREATE IN-APP NOTIFICATIONS
    ====================================================== */

    const notifications =
      await Notification.insertMany(

        students.map((student) => ({

          student: student._id,
          title,
          message,
          type,
          relatedPaymentPurpose,
          sentBy: req.user.id,

        }))

      );

    /* =====================================================
       SEND EMAILS (best-effort, in parallel)
    ====================================================== */

    const emailResults =
      await Promise.allSettled(

        students.map((student) =>

          sendEmail({

            to: student.email,

            subject: title,

            text: message,

            html: `<p>Hi ${student.name},</p><p>${message}</p>`,

          })

        )

      );

    const sentStudentIds = students

      .filter(
        (_, i) =>
          emailResults[i].status === "fulfilled"
      )

      .map((s) => s._id);

    if (sentStudentIds.length > 0) {

      await Notification.updateMany(

        {

          _id: {
            $in: notifications.map((n) => n._id),
          },

          student: { $in: sentStudentIds },

        },

        { $set: { emailSent: true } }

      );

    }

    const emailsSent = sentStudentIds.length;
    const emailsFailed =
      emailResults.length - emailsSent;

    return successResponse(

      res,

      "Alert sent successfully.",

      {

        notified: students.length,
        emailsSent,
        emailsFailed,

      }

    );

  } catch (error) {

    console.error(
      "SEND PAYMENT ALERT ERROR:",
      error
    );

    return errorResponse(

      res,

      "Failed to send payment alert.",

      500,

      error.message

    );

  }

};

/* ==========================================================================
   STUDENT: GET MY NOTIFICATIONS
============================================================================= */

export const getMyNotifications = async (
  req,
  res
) => {

  try {

    const notifications =
      await Notification.find({

        student: req.user.id,

      }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(

      (n) => !n.isRead

    ).length;

    return successResponse(

      res,

      "Notifications fetched successfully.",

      { notifications, unreadCount }

    );

  } catch (error) {

    console.error(
      "GET MY NOTIFICATIONS ERROR:",
      error
    );

    return errorResponse(

      res,

      "Failed to fetch notifications.",

      500,

      error.message

    );

  }

};

/* ==========================================================================
   STUDENT: MARK NOTIFICATION AS READ
============================================================================= */

export const markNotificationRead = async (
  req,
  res
) => {

  try {

    const notification =
      await Notification.findOne({

        _id: req.params.id,

        student: req.user.id,

      });

    if (!notification) {

      return errorResponse(

        res,

        "Notification not found.",

        404

      );

    }

    notification.isRead = true;

    await notification.save();

    return successResponse(

      res,

      "Notification marked as read.",

      notification

    );

  } catch (error) {

    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    );

    return errorResponse(

      res,

      "Failed to update notification.",

      500,

      error.message

    );

  }

};