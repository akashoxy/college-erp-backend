import mongoose from "mongoose";
import Holiday from "../../models/academics/Holiday.js";

/* ==========================================================
   RESPONSE HELPERS
========================================================== */

const successResponse = (
  res,
  statusCode,
  message,
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  statusCode,
  message,
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error
        : undefined,
  });
};

/* ==========================================================
   VALIDATE OBJECT ID
========================================================== */

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/* ==========================================================
   GET ALL HOLIDAYS
========================================================== */

export const getHolidays = async (
  req,
  res
) => {
  try {
    const holidays =
      await Holiday.find()
        .sort({ date: 1 })
        .lean();

    return successResponse(
      res,
      200,
      "Holidays fetched successfully.",
      holidays
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch holidays.",
      error.message
    );
  }
};

/* ==========================================================
   GET SINGLE HOLIDAY
========================================================== */

export const getHolidayById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid holiday ID."
        );
      }

      const holiday =
        await Holiday.findById(id).lean();

      if (!holiday) {
        return errorResponse(
          res,
          404,
          "Holiday not found."
        );
      }

      return successResponse(
        res,
        200,
        "Holiday fetched successfully.",
        holiday
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to fetch holiday.",
        error.message
      );
    }
  };

/* ==========================================================
   CREATE HOLIDAY
========================================================== */

export const createHoliday =
  async (req, res) => {
    try {
      const {
        date,
        day,
        particular,
      } = req.body;

      if (
        !date ||
        !day ||
        !particular
      ) {
        return errorResponse(
          res,
          400,
          "Date, day and particular are required."
        );
      }

      const holiday =
        await Holiday.create({
          ...req.body,
        });

      return successResponse(
        res,
        201,
        "Holiday created successfully.",
        holiday
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to create holiday.",
        error.message
      );
    }
  };

/* ==========================================================
   UPDATE HOLIDAY
========================================================== */

export const updateHoliday =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid holiday ID."
        );
      }

      const holiday =
        await Holiday.findByIdAndUpdate(
          id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!holiday) {
        return errorResponse(
          res,
          404,
          "Holiday not found."
        );
      }

      return successResponse(
        res,
        200,
        "Holiday updated successfully.",
        holiday
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to update holiday.",
        error.message
      );
    }
  };

/* ==========================================================
   DELETE HOLIDAY
========================================================== */

export const deleteHoliday =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid holiday ID."
        );
      }

      const holiday =
        await Holiday.findByIdAndDelete(
          id
        );

      if (!holiday) {
        return errorResponse(
          res,
          404,
          "Holiday not found."
        );
      }

      return successResponse(
        res,
        200,
        "Holiday deleted successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to delete holiday.",
        error.message
      );
    }
  };