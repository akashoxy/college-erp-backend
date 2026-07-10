import PlacedStudent from "../../models/campus-tour/PlacedStudent.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   CREATE PLACED STUDENT
========================================================== */

export const createStudent = async (
  req,
  res
) => {
  try {

    let image = "";
    let imagePublicId = "";

    if (req.file) {

      const result =
        await uploadImageToCloudinary(
          req.file,
          "placed-students"
        );

      image =
        result.secure_url;

      imagePublicId =
        result.public_id;

    }

    const student =
      await PlacedStudent.create({
        studentName:
          req.body.studentName,
        department:
          req.body.department,
        company:
          req.body.company,
        designation:
          req.body.designation,
        package:
          req.body.package,
        placementYear:
          req.body.placementYear,
        image,
        imagePublicId,
      });

    return successResponse(
      res,
      "Placed student created successfully.",
      student,
      201
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to create placed student."
    );

  }
};

/* ==========================================================
   GET ALL PLACED STUDENTS
========================================================== */

export const getStudents = async (
  req,
  res
) => {
  try {

    const students =
      await PlacedStudent.find()
        .sort({
          placementYear: -1,
        })
        .lean();

    return successResponse(
      res,
      "Placed students fetched successfully.",
      students
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to fetch placed students."
    );

  }
};

/* ==========================================================
   Continue in Part 2
========================================================== */
/* ==========================================================
   GET PLACED STUDENT BY ID
========================================================== */

export const getStudentById = async (
  req,
  res
) => {
  try {

    const student =
      await PlacedStudent.findById(
        req.params.id
      ).lean();

    if (!student) {
      return errorResponse(
        res,
        "Placed student not found.",
        404
      );
    }

    return successResponse(
      res,
      "Placed student fetched successfully.",
      student
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to fetch placed student."
    );

  }
};

/* ==========================================================
   UPDATE PLACED STUDENT
========================================================== */

export const updateStudent = async (
  req,
  res
) => {
  try {

    const student =
      await PlacedStudent.findById(
        req.params.id
      );

    if (!student) {
      return errorResponse(
        res,
        "Placed student not found.",
        404
      );
    }

    Object.assign(
      student,
      req.body
    );

    if (req.file) {

      if (
        student.imagePublicId
      ) {
        await deleteFromCloudinary(
          student.imagePublicId,
          "image"
        );
      }

      const result =
        await uploadImageToCloudinary(
          req.file,
          "placed-students"
        );

      student.image =
        result.secure_url;

      student.imagePublicId =
        result.public_id;

    }

    await student.save();

    return successResponse(
      res,
      "Placed student updated successfully.",
      student
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to update placed student."
    );

  }
};

/* ==========================================================
   DELETE PLACED STUDENT
========================================================== */

export const deleteStudent = async (
  req,
  res
) => {
  try {

    const student =
      await PlacedStudent.findById(
        req.params.id
      );

    if (!student) {
      return errorResponse(
        res,
        "Placed student not found.",
        404
      );
    }

    if (
      student.imagePublicId
    ) {
      await deleteFromCloudinary(
        student.imagePublicId,
        "image"
      );
    }

    await student.deleteOne();

    return successResponse(
      res,
      "Placed student deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to delete placed student."
    );

  }
};