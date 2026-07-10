import Admission from "../../models/admission/Admission.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   CREATE ADMISSION ENQUIRY
========================================================== */

export const createAdmission = async (
  req,
  res
) => {
  try {
    const admission =
      await Admission.create(
        req.body
      );

    return successResponse(
      res,
      201,
      "Admission enquiry submitted successfully.",
      admission
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to submit admission enquiry.",
        error
    );

  }
};

/* ==========================================================
   GET ALL ADMISSION ENQUIRIES
========================================================== */

export const getAdmissions = async (
  req,
  res
) => {
  try {
    const admissions =
      await Admission.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return successResponse(
      res,
      200,
      "Admission enquiries fetched successfully.",
      admissions
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to fetch admission enquiries.",
        error
    );

  }
};

/* ==========================================================
   Continue in Part 2
========================================================== */
/* ==========================================================
   DELETE ADMISSION ENQUIRY
========================================================== */

export const deleteAdmission = async (
  req,
  res
) => {
  try {
    const admission =
      await Admission.findById(
        req.params.id
      );

    if (!admission) {
      return errorResponse(
        res,
        404,
        "Admission enquiry not found.",
      );
    }

    await admission.deleteOne();

    return successResponse(
      res,
      200,
      "Admission enquiry deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to delete admission enquiry.",
        error
    );

  }
};

/* ==========================================================
   UPDATE ADMISSION STATUS
========================================================== */

export const updateAdmissionStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const admission =
      await Admission.findById(
        req.params.id
      );

    if (!admission) {
      return errorResponse(
        res,
        404,
        "Admission enquiry not found.",
      );
    }

    admission.status =
      status ??
      admission.status;

    await admission.save();

    return successResponse(
      res,
      200,
      "Admission status updated successfully.",
      admission
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to update admission status.",
        error
    );

  }
};