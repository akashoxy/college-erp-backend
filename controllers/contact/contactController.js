import mongoose from "mongoose";
import Contact from "../../models/contact/Contact.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   CREATE ENQUIRY
========================================================== */

export const createEnquiry = async (
  req,
  res
) => {
  try {
    const {
      fullName,
      email,
      phone,
      queryType,
      message,
    } = req.body;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !queryType?.trim() ||
      !message?.trim()
    ) {
      return errorResponse(
        res,
        "All fields are required.",
        400
      );
    }

    const enquiry =
      await Contact.create({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        queryType: queryType.trim(),
        message: message.trim(),
      });

    return successResponse(
      res,
      "Enquiry submitted successfully.",
      enquiry,
      201
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to submit enquiry."
    );
  }
};

/* ==========================================================
   GET ALL ENQUIRIES
========================================================== */

export const getEnquiries = async (
  req,
  res
) => {
  try {
    const enquiries =
      await Contact.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return successResponse(
      res,
      "Enquiries fetched successfully.",
      {
        count: enquiries.length,
        enquiries,
      }
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch enquiries."
    );
  }
};

/* ==========================================================
   GET SINGLE ENQUIRY
========================================================== */

export const getEnquiryById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return errorResponse(
          res,
          "Invalid enquiry ID.",
          400
        );
      }

      const enquiry =
        await Contact.findById(id).lean();

      if (!enquiry) {
        return errorResponse(
          res,
          "Enquiry not found.",
          404
        );
      }

      return successResponse(
        res,
        "Enquiry fetched successfully.",
        enquiry
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to fetch enquiry."
      );
    }
  };

/* ==========================================================
   UPDATE STATUS
========================================================== */

export const updateEnquiryStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      const { status } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return errorResponse(
          res,
          "Invalid enquiry ID.",
          400
        );
      }

      const allowedStatus = [
        "Pending",
        "In Progress",
        "Resolved",
      ];

      if (
        !allowedStatus.includes(status)
      ) {
        return errorResponse(
          res,
          "Invalid enquiry status.",
          400
        );
      }

      const enquiry =
        await Contact.findByIdAndUpdate(
          id,
          { status },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!enquiry) {
        return errorResponse(
          res,
          "Enquiry not found.",
          404
        );
      }

      return successResponse(
        res,
        "Enquiry status updated successfully.",
        enquiry
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to update enquiry status."
      );
    }
  };

/* ==========================================================
   DELETE ENQUIRY
========================================================== */

export const deleteEnquiry =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return errorResponse(
          res,
          "Invalid enquiry ID.",
          400
        );
      }

      const enquiry =
        await Contact.findByIdAndDelete(
          id
        );

      if (!enquiry) {
        return errorResponse(
          res,
          "Enquiry not found.",
          404
        );
      }

      return successResponse(
        res,
        "Enquiry deleted successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        "Failed to delete enquiry."
      );
    }
  };