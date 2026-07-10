import Subject from "../../models/admin/Subject.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   VALIDATE SEMESTER
============================================================================= */

const validateSemester = (
  stream,
  semester
) => {
  const sem = Number(semester);

  if (
    stream === "MCA" &&
    (sem < 1 || sem > 4)
  ) {
    return "MCA has only 4 semesters.";
  }

  if (
    ["BCA", "BBA"].includes(stream) &&
    (sem < 1 || sem > 8)
  ) {
    return `${stream} has only 8 semesters.`;
  }

  return null;
};

/* ==========================================================================
   CREATE SUBJECT
============================================================================= */

export const createSubject = async (
  req,
  res
) => {
  try {
    const {
      subjectCode,
      session,
      stream,
      semester,
    } = req.body;

    const semesterError =
      validateSemester(
        stream,
        semester
      );

    if (semesterError) {
      return errorResponse(
        res,
        400,
        semesterError
      );
    }

    const existing =
      await Subject.findOne({
        subjectCode: subjectCode.trim(),
        session: session.trim(),
      });

    if (existing) {
      return errorResponse(
        res,
        400,
        "Subject already exists."
      );
    }

    const subject =
      await Subject.create({
        ...req.body,
        subjectCode:
          subjectCode.trim(),
        session:
          session.trim(),
      });

    return successResponse(
      res,
      201,
      "Subject created successfully.",
      {
        subject,
      }
    );
  } catch (error) {
    console.error(
      "Create Subject Error:",
      error
    );

    return errorResponse(
      res,
      500,
      error.message
    );
  }
};

/* ==========================================================================
   GET SUBJECTS
============================================================================= */

export const getSubjects = async (
  req,
  res
) => {
  try {
    const subjects =
      await Subject.find({
        isActive: true,
      }).sort({
        stream: 1,
        semester: 1,
        subjectName: 1,
      });

    return successResponse(
      res,
      200,
      "Subjects fetched successfully.",
      {
        count:
          subjects.length,
        subjects,
      }
    );
  } catch (error) {
    console.error(
      "Get Subjects Error:",
      error
    );

    return errorResponse(
      res,
      500,
      error.message
    );
  }
};

/* ==========================================================================
   UPDATE SUBJECT
============================================================================= */

export const updateSubject = async (
  req,
  res
) => {
  try {
    const {
      subjectCode,
      session,
      stream,
      semester,
    } = req.body;

    const subject =
      await Subject.findById(
        req.params.id
      );

    if (!subject) {
      return errorResponse(
        res,
        404,
        "Subject not found."
      );
    }

    const semesterError =
      validateSemester(
        stream,
        semester
      );

    if (semesterError) {
      return errorResponse(
        res,
        400,
        semesterError
      );
    }

    const duplicate =
      await Subject.findOne({
        _id: {
          $ne: req.params.id,
        },
        subjectCode:
          subjectCode.trim(),
        session:
          session.trim(),
      });

    if (duplicate) {
      return errorResponse(
        res,
        400,
        "Another subject with the same code and session already exists."
      );
    }

    const updated =
      await Subject.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          subjectCode:
            subjectCode.trim(),
          session:
            session.trim(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    return successResponse(
      res,
      200,
      "Subject updated successfully.",
      {
        subject: updated,
      }
    );
  } catch (error) {
    console.error(
      "Update Subject Error:",
      error
    );

    return errorResponse(
      res,
      500,
      error.message
    );
  }
};

/* ==========================================================================
   DELETE SUBJECT (SOFT DELETE)
============================================================================= */

export const deleteSubject = async (
  req,
  res
) => {
  try {
    const subject =
      await Subject.findById(
        req.params.id
      );

    if (!subject) {
      return errorResponse(
        res,
        404,
        "Subject not found."
      );
    }

    subject.isActive = false;

    await subject.save();

    return successResponse(
      res,
      200,
      "Subject deactivated successfully."
    );
  } catch (error) {
    console.error(
      "Delete Subject Error:",
      error
    );

    return errorResponse(
      res,
      500,
      error.message
    );
  }
};