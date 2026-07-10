import PreviousQuestionPaper from "../../models/student/PreviousQuestionPaper.js";

import {
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   CREATE QUESTION PAPER
============================================================================= */

export const createPaper = async (
  req,
  res
) => {
  try {
    const {
      title,
      program,
      semester,
      subject,
      year,
      paperType,
      description,
    } = req.body;

    /* ======================================
       VALIDATION
    ====================================== */

    if (
      !title ||
      !program ||
      !semester ||
      !subject ||
      !year ||
      !paperType
    ) {
      return errorResponse(
        res,
        "All required fields must be provided.",
        400
      );
    }

    let pdfFile = "";
    let pdfPublicId = "";

    /* ======================================
       UPLOAD PDF
    ====================================== */

    if (req.file) {
      const result =
        await uploadPdfToCloudinary(
          req.file,
          "previous-question-papers"
        );

      pdfFile =
        result.secure_url;

      pdfPublicId =
        result.public_id;
    }

    /* ======================================
       CREATE PAPER
    ====================================== */

    const paper =
      await PreviousQuestionPaper.create({
        title: title.trim(),
        program,
        semester,
        subject: subject.trim(),
        year,
        paperType,
        description:
          description?.trim() || "",
        pdfFile,
        pdfPublicId,
      });

    return successResponse(
      res,
      "Question paper uploaded successfully.",
      paper,
      201
    );
  } catch (error) {
    console.error(
      "CREATE PAPER ERROR:",
      error
    );

    return errorResponse(
      res,
      "Failed to upload question paper.",
      500,
      error.message
    );
  }
};

/* ==========================================================================
   GET ALL QUESTION PAPERS
============================================================================= */

export const getAllPapers =
  async (
    req,
    res
  ) => {
    try {
      const papers =
        await PreviousQuestionPaper.find()
          .sort({
            year: -1,
            createdAt: -1,
          });

      return successResponse(
        res,
        "Question papers fetched successfully.",
        papers
      );
    } catch (error) {
      console.error(
        "GET ALL PAPERS ERROR:",
        error
      );

      return errorResponse(
        res,
        "Failed to fetch question papers.",
        500,
        error.message
      );
    }
  };
  /* ==========================================================================
   GET QUESTION PAPER BY ID
============================================================================= */

export const getPaperById =
  async (
    req,
    res
  ) => {
    try {
      const paper =
        await PreviousQuestionPaper.findById(
          req.params.id
        );

      if (!paper) {
        return errorResponse(
          res,
          "Question paper not found.",
          404
        );
      }

      return successResponse(
        res,
        "Question paper fetched successfully.",
        paper
      );
    } catch (error) {
      console.error(
        "GET PAPER ERROR:",
        error
      );

      return errorResponse(
        res,
        "Failed to fetch question paper.",
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   UPDATE QUESTION PAPER
============================================================================= */

export const updatePaper =
  async (
    req,
    res
  ) => {
    try {
      const {
        title,
        program,
        semester,
        subject,
        year,
        paperType,
        description,
        pdfRemoved,
      } = req.body;

      /* ======================================
         FIND PAPER
      ====================================== */

      const paper =
        await PreviousQuestionPaper.findById(
          req.params.id
        );

      if (!paper) {
        return errorResponse(
          res,
          "Question paper not found.",
          404
        );
      }

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !title ||
        !program ||
        !semester ||
        !subject ||
        !year ||
        !paperType
      ) {
        return errorResponse(
          res,
          "All required fields must be provided.",
          400
        );
      }

      let pdfFile =
        paper.pdfFile;

      let pdfPublicId =
        paper.pdfPublicId;

      /* ======================================
         REMOVE EXISTING PDF
      ====================================== */

      if (
        pdfRemoved === "true"
      ) {

        if (pdfPublicId) {

          await deleteFromCloudinary(
            pdfPublicId,
            "raw"
          );

        }

        pdfFile = "";

        pdfPublicId = "";

      }

      /* ======================================
         UPLOAD NEW PDF
      ====================================== */

      if (req.file) {

        if (pdfPublicId) {

          await deleteFromCloudinary(
            pdfPublicId,
            "raw"
          );

        }

        const result =
          await uploadPdfToCloudinary(
            req.file,
            "previous-question-papers"
          );

        pdfFile =
          result.secure_url;

        pdfPublicId =
          result.public_id;

      }

      /* ======================================
         UPDATE PAPER
      ====================================== */

      const updatedPaper =
        await PreviousQuestionPaper.findByIdAndUpdate(
          req.params.id,
          {
            title:
              title.trim(),

            program,

            semester,

            subject:
              subject.trim(),

            year,

            paperType,

            description:
              description?.trim() ||
              "",

            pdfFile,

            pdfPublicId,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      return successResponse(
        res,
        "Question paper updated successfully.",
        updatedPaper
      );
    } catch (error) {
      console.error(
        "UPDATE PAPER ERROR:",
        error
      );

      return errorResponse(
        res,
        "Failed to update question paper.",
        500,
        error.message
      );
    }
  };
  /* ==========================================================================
   DELETE QUESTION PAPER
============================================================================= */

export const deletePaper =
  async (
    req,
    res
  ) => {
    try {
      const paper =
        await PreviousQuestionPaper.findById(
          req.params.id
        );

      if (!paper) {
        return errorResponse(
          res,
          "Question paper not found.",
          404
        );
      }

      /* ======================================
         DELETE PDF FROM CLOUDINARY
      ====================================== */

      if (paper.pdfPublicId) {
        await deleteFromCloudinary(
          paper.pdfPublicId,
          "raw"
        );
      }

      /* ======================================
         DELETE PAPER
      ====================================== */

      await paper.deleteOne();

      return successResponse(
        res,
        "Question paper deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE PAPER ERROR:",
        error
      );

      return errorResponse(
        res,
        "Failed to delete question paper.",
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   SEARCH QUESTION PAPERS
============================================================================= */

export const searchPapers =
  async (
    req,
    res
  ) => {
    try {
      const keyword =
        req.query.q?.trim() || "";

      const papers =
        await PreviousQuestionPaper.find({
          $or: [
            {
              title: {
                $regex: keyword,
                $options: "i",
              },
            },
            {
              subject: {
                $regex: keyword,
                $options: "i",
              },
            },
            {
              program: {
                $regex: keyword,
                $options: "i",
              },
            },
          ],
        }).sort({
          year: -1,
          createdAt: -1,
        });

      return successResponse(
        res,
        "Search completed successfully.",
        papers
      );
    } catch (error) {
      console.error(
        "SEARCH PAPER ERROR:",
        error
      );

      return errorResponse(
        res,
        "Failed to search question papers.",
        500,
        error.message
      );
    }
  };

/* ==========================================================================
   FILTER QUESTION PAPERS
============================================================================= */

export const filterPapers =
  async (
    req,
    res
  ) => {
    try {
      const {
        program,
        semester,
        year,
        paperType,
      } = req.query;

      const filter = {};

      if (program)
        filter.program =
          program;

      if (semester)
        filter.semester =
          semester;

      if (year)
        filter.year = year;

      if (paperType)
        filter.paperType =
          paperType;

      const papers =
        await PreviousQuestionPaper.find(
          filter
        ).sort({
          year: -1,
          createdAt: -1,
        });

      return successResponse(
        res,
        "Question papers fetched successfully.",
        papers
      );
    } catch (error) {
      console.error(
        "FILTER PAPER ERROR:",
        error
      );

      return errorResponse(
        res,
        "Failed to filter question papers.",
        500,
        error.message
      );
    }
  };