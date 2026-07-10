import multer from "multer";

import AdmissionProcedure from "../../models/admission/AdmissionProcedure.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/uploadToCloudinary.js";

/* ==========================================================
   MULTER (IN-MEMORY, IMAGES ONLY)
========================================================== */

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {

    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }

    cb(null, true);

  },
});

export const uploadProcedureImageMiddleware =
  imageUpload.single("image");

/* ==========================================================
   UPLOAD PROGRAM CARD IMAGE
========================================================== */

export const uploadProcedureImage = async (
  req,
  res
) => {
  try {

    if (!req.file) {

      return errorResponse(
        res,
        "No image file provided.",
        400
      );

    }

    // Best-effort cleanup of the image being replaced.
    const oldPublicId =
      req.body?.oldPublicId;

    if (oldPublicId) {

      await deleteFromCloudinary(
        oldPublicId
      );

    }

    const result =
      await uploadImageToCloudinary(
        req.file,
        "admission-procedures"
      );

    return successResponse(
      res,
      "Image uploaded successfully.",
      {
        url:
          result.secure_url ||
          result.url,

        publicId:
          result.public_id ||
          result.publicId,
      }
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to upload image."
    );

  }
};

/* ==========================================================
   CREATE ADMISSION PROCEDURE
========================================================== */

export const createProcedure = async (
  req,
  res
) => {
  try {
    const procedure =
      await AdmissionProcedure.create(
        req.body
      );

    return successResponse(
      res,
      "Admission Procedure created successfully.",
      procedure,
      201
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to create Admission Procedure."
    );

  }
};

/* ==========================================================
   GET ALL ADMISSION PROCEDURES
========================================================== */

export const getProcedures = async (
  req,
  res
) => {
  try {
    const procedures =
      await AdmissionProcedure.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return successResponse(
      res,
      "Admission Procedures fetched successfully.",
      procedures
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to fetch Admission Procedures."
    );

  }
};

/* ==========================================================
   Continue in Part 2
========================================================== */
/* ==========================================================
   UPDATE ADMISSION PROCEDURE
========================================================== */

export const updateProcedure = async (
  req,
  res
) => {
  try {
    const procedure =
      await AdmissionProcedure.findById(
        req.params.id
      );

    if (!procedure) {
      return errorResponse(
        res,
        "Admission Procedure not found.",
        404
      );
    }

    Object.assign(
      procedure,
      req.body
    );

    await procedure.save();

    return successResponse(
      res,
      "Admission Procedure updated successfully.",
      procedure
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to update Admission Procedure."
    );

  }
};

/* ==========================================================
   DELETE ADMISSION PROCEDURE
========================================================== */

export const deleteProcedure = async (
  req,
  res
) => {
  try {
    const procedure =
      await AdmissionProcedure.findById(
        req.params.id
      );

    if (!procedure) {
      return errorResponse(
        res,
        "Admission Procedure not found.",
        404
      );
    }

    if (procedure.imagePublicId) {

      await deleteFromCloudinary(
        procedure.imagePublicId
      );

    }

    await procedure.deleteOne();

    return successResponse(
      res,
      "Admission Procedure deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to delete Admission Procedure."
    );

  }
};