import Program from "../../models/admission/Program.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   GET ALL PROGRAMS
========================================================== */

export const getPrograms = async (
  req,
  res
) => {
  try {
    const programs =
      await Program.find()
        .sort({
          createdAt: 1,
        })
        .lean();

    return successResponse(
      res,
      "Programs fetched successfully.",
      programs
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to fetch programs."
    );

  }
};

/* ==========================================================
   CREATE PROGRAM
========================================================== */

export const createProgram = async (
  req,
  res
) => {
  try {
    const program =
      await Program.create(
        req.body
      );

    return successResponse(
      res,
      "Program created successfully.",
      program,
      201
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to create program."
    );

  }
};


/* ==========================================================
   UPDATE PROGRAM
========================================================== */

export const updateProgram = async (
  req,
  res
) => {
  try {
    const program =
      await Program.findById(
        req.params.id
      );

    if (!program) {
      return errorResponse(
        res,
        "Program not found.",
        404
      );
    }

    Object.assign(
      program,
      req.body
    );

    await program.save();

    return successResponse(
      res,
      "Program updated successfully.",
      program
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to update program."
    );

  }
};

/* ==========================================================
   DELETE PROGRAM
========================================================== */

export const deleteProgram = async (
  req,
  res
) => {
  try {
    const program =
      await Program.findById(
        req.params.id
      );

    if (!program) {
      return errorResponse(
        res,
        "Program not found.",
        404
      );
    }

    await program.deleteOne();

    return successResponse(
      res,
      "Program deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to delete program."
    );

  }
};