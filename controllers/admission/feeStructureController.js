import FeeStructure from "../../models/admission/FeeStructure.js";

import {
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   HELPERS
========================================================== */

const parseJsonField = (
  value,
  fallback = []
) => {

  if (!value)
    return fallback;

  try {

    return typeof value ===
      "string"
      ? JSON.parse(value)
      : value;

  } catch {

    return fallback;

  }

};

/* ==========================================================
   CREATE / UPDATE FEE STRUCTURE
========================================================== */

export const createOrUpdateFeeStructure =
  async (req, res) => {

    try {

      const {
        stream,
        duration,
        admissionFee,
        semesterFees,
        batch,
        notes,
      } = req.body;

      /* ======================================
         VALIDATION
      ====================================== */

      if (!stream) {

        return errorResponse(
          res,
          400,
          "Stream is required."
        );

      }

      if (!duration) {

        return errorResponse(
          res,
          400,
          "Duration is required."
        );

      }

      const parsedFees =
        parseJsonField(
          semesterFees
        );

      if (
        !parsedFees.length
      ) {

        return errorResponse(
          res,
          400,
          "At least one semester fee is required."
        );

      }

      if (
        parsedFees.some(
          ({ amount }) =>
            !amount ||
            Number(amount) <= 0
        )
      ) {

        return errorResponse(
          res,
          400,
          "All semester fee amounts are required."
        );

      }

      const parsedNotes =
        parseJsonField(
          notes
        );

const admissionAmount = Number(admissionFee || 0);

const totalSemesterFees = parsedFees.reduce(
  (sum, semester, index) => {
    if (index === 0) return sum; // Semester 1 is included in Admission Fee
    return sum + Number(semester.amount || 0);
  },
  0
);

const totalFee = admissionAmount + totalSemesterFees;


      /* ======================================
         FIND OR CREATE
      ====================================== */

      let feeStructure =
        await FeeStructure.findOne({
          stream,
        });

      const isNew =
        !feeStructure;

      if (!feeStructure) {

        feeStructure =
          new FeeStructure({
            stream,
          });

      }

      feeStructure.stream =
        stream;

      feeStructure.duration =
        duration;

      feeStructure.admissionFee =
        Number(
          admissionFee || 0
        );

      feeStructure.semesterFees =
        parsedFees;

      feeStructure.batch =
        batch;

      feeStructure.notes =
        parsedNotes;

      feeStructure.totalFee =
        totalFee;

      /* ======================================
         PDF UPLOAD
      ====================================== */

      if (req.file) {

        if (
          feeStructure.pdfPublicId
        ) {

          await deleteFromCloudinary(
            feeStructure.pdfPublicId,
            "raw"
          );

        }

        const upload =
          await uploadPdfToCloudinary(
            req.file,
            "fee-structure"
          );

        feeStructure.pdfFile =
          upload.secure_url;

        feeStructure.pdfPublicId =
          upload.public_id;

      }

      await feeStructure.save();

      return successResponse(
        res,
        isNew
          ? 201
          : 200,
        isNew
          ? "Fee Structure created successfully."
          : "Fee Structure updated successfully.",
        {
          feeStructure,
        }
      );

    } catch (error) {

      console.error(
        "Create/Update Fee Structure Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message ||
          "Failed to save Fee Structure."
      );

    }

  };
  /* ==========================================================
   GET ALL FEE STRUCTURES
========================================================== */

export const getFeeStructures =
  async (req, res) => {

    try {

      const feeStructures =
        await FeeStructure.find()
          .sort({
            stream: 1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Fee Structures fetched successfully.",
        {
          feeStructures,
          count:
            feeStructures.length,
        }
      );

    } catch (error) {

      console.error(
        "Get Fee Structures Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message ||
          "Failed to fetch Fee Structures."
      );

    }

  };

/* ==========================================================
   GET FEE STRUCTURE BY STREAM
========================================================== */

export const getFeeStructureByStream =
  async (req, res) => {

    try {

      const {
        stream,
      } = req.params;

      const feeStructure =
        await FeeStructure.findOne({
          stream,
        }).lean();

      if (!feeStructure) {

        return errorResponse(
          res,
          404,
          "Fee Structure not found."
        );

      }

      return successResponse(
        res,
        200,
        "Fee Structure fetched successfully.",
        {
          feeStructure,
        }
      );

    } catch (error) {

      console.error(
        "Get Fee Structure Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message ||
          "Failed to fetch Fee Structure."
      );

    }

  };
  /* ==========================================================
   DELETE FEE STRUCTURE
========================================================== */

export const deleteFeeStructure =
  async (req, res) => {

    try {

      const feeStructure =
        await FeeStructure.findById(
          req.params.id
        );

      if (!feeStructure) {

        return errorResponse(
          res,
          404,
          "Fee Structure not found."
        );

      }

      /* ======================================
         DELETE PDF FROM CLOUDINARY
      ====================================== */

      if (
        feeStructure.pdfPublicId
      ) {

        await deleteFromCloudinary(
          feeStructure.pdfPublicId,
          "raw"
        );

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await feeStructure.deleteOne();

      return successResponse(
        res,
        200,
        "Fee Structure deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete Fee Structure Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message ||
          "Failed to delete Fee Structure."
      );

    }

  };