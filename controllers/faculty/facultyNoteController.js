import FacultyNote from "../../models/faculty/FacultyNote.js";
import Faculty from "../../models/faculty/Faculty.js";

import {
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================================
   CREATE FACULTY NOTE
============================================================================= */

export const createFacultyNote = async (
  req,
  res
) => {
  try {
    const {
      program,
      semester,
      subject,
      title,
    } = req.body;

    const faculty =
      await Faculty.findById(
        req.user.id
      );

    if (!faculty) {
      return errorResponse(
        res,
        404,
        "Faculty not found."
      );
    }

    /* ======================================
       VALIDATE PDF
    ====================================== */

    if (!req.file) {
      return errorResponse(
        res,
        400,
        "Please upload a PDF file."
      );
    }

    if (
      req.file.mimetype !==
      "application/pdf"
    ) {
      return errorResponse(
        res,
        400,
        "Only PDF files are allowed."
      );
    }

    /* ======================================
       UPLOAD PDF
    ====================================== */

    const uploadResult =
      await uploadPdfToCloudinary(
        req.file,
        "faculty-notes"
      );

    const note =
      await FacultyNote.create({
        uploadedBy:
          faculty._id,

        facultyName:
          faculty.name ||
          faculty.fullName ||
          "Faculty",

        program,
        semester,
        subject,
        title,

        pdfFile:
          uploadResult.secure_url,

        pdfPublicId:
          uploadResult.public_id,
      });

    return successResponse(
      res,
      201,
      "Faculty note uploaded successfully.",
      {
        note,
      }
    );
  } catch (error) {
    console.error(
      "Create Faculty Note Error:",
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
   GET ALL FACULTY NOTES
============================================================================= */

export const getAllFacultyNotes =
  async (req, res) => {
    try {
      const notes =
        await FacultyNote.find()
          .sort({
            program: 1,
            semester: 1,
            subject: 1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Faculty notes fetched successfully.",
        {
          count:
            notes.length,
          notes,
        }
      );
    } catch (error) {
      console.error(
        "Get Faculty Notes Error:",
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
   GET SINGLE FACULTY NOTE
============================================================================= */

export const getFacultyNoteById =
  async (req, res) => {
    try {
      const note =
        await FacultyNote.findById(
          req.params.id
        ).lean();

      if (!note) {
        return errorResponse(
          res,
          404,
          "Faculty note not found."
        );
      }

      return successResponse(
        res,
        200,
        "Faculty note fetched successfully.",
        {
          note,
        }
      );
    } catch (error) {
      console.error(
        "Get Faculty Note Error:",
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
   UPDATE FACULTY NOTE
============================================================================= */

export const updateFacultyNote =
  async (req, res) => {
    try {
      const note =
        await FacultyNote.findById(
          req.params.id
        );

      if (!note) {
        return errorResponse(
          res,
          404,
          "Faculty note not found."
        );
      }

      /* ======================================
         OWNERSHIP CHECK
      ====================================== */

      if (
        note.uploadedBy.toString() !==
        req.user.id
      ) {
        return errorResponse(
          res,
          403,
          "You can update only your own notes."
        );
      }

      let pdfFile =
        note.pdfFile;

      let pdfPublicId =
        note.pdfPublicId;

      /* ======================================
         REMOVE EXISTING PDF
      ====================================== */

      if (
        req.body.removePdf ===
        "true"
      ) {
        if (pdfPublicId) {
          await deleteFromCloudinary(
            pdfPublicId
          );
        }

        pdfFile = "";
        pdfPublicId = "";
      }

      /* ======================================
         UPLOAD NEW PDF
      ====================================== */

      if (req.file) {
        if (
          req.file.mimetype !==
          "application/pdf"
        ) {
          return errorResponse(
            res,
            400,
            "Only PDF files are allowed."
          );
        }

        if (pdfPublicId) {
          await deleteFromCloudinary(
            pdfPublicId
          );
        }

        const uploadResult =
          await uploadPdfToCloudinary(
            req.file,
            "faculty-notes"
          );

        pdfFile =
          uploadResult.secure_url;

        pdfPublicId =
          uploadResult.public_id;
      }
            /* ======================================
         UPDATE FIELDS
      ====================================== */

      note.program =
        req.body.program ??
        note.program;

      note.semester =
        req.body.semester ??
        note.semester;

      note.subject =
        req.body.subject ??
        note.subject;

      note.title =
        req.body.title ??
        note.title;

      note.pdfFile =
        pdfFile;

      note.pdfPublicId =
        pdfPublicId;

      await note.save();

      return successResponse(
        res,
        200,
        "Faculty note updated successfully.",
        {
          note,
        }
      );
    } catch (error) {
      console.error(
        "Update Faculty Note Error:",
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
   DELETE FACULTY NOTE
============================================================================= */

export const deleteFacultyNote =
  async (req, res) => {
    try {
      const note =
        await FacultyNote.findById(
          req.params.id
        );

      if (!note) {
        return errorResponse(
          res,
          404,
          "Faculty note not found."
        );
      }

      /* ======================================
         OWNERSHIP CHECK
      ====================================== */

      if (
        note.uploadedBy.toString() !==
        req.user.id
      ) {
        return errorResponse(
          res,
          403,
          "You can delete only your own notes."
        );
      }

      /* ======================================
         DELETE PDF FROM CLOUDINARY
      ====================================== */

      if (note.pdfPublicId) {
        await deleteFromCloudinary(
          note.pdfPublicId
        );
      }

      /* ======================================
         DELETE NOTE
      ====================================== */

      await note.deleteOne();

      return successResponse(
        res,
        200,
        "Faculty note deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete Faculty Note Error:",
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
   GET MY FACULTY NOTES
============================================================================= */

export const getMyFacultyNotes =
  async (req, res) => {
    try {
      const notes =
        await FacultyNote.find({
          uploadedBy:
            req.user.id,
        })
          .sort({
            program: 1,
            semester: 1,
            subject: 1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Faculty notes fetched successfully.",
        {
          count:
            notes.length,
          notes,
        }
      );
    } catch (error) {
      console.error(
        "Get My Faculty Notes Error:",
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
   GET STUDENT NOTES
============================================================================= */

export const getStudentNotes =
  async (req, res) => {
    try {
      const notes =
        await FacultyNote.find({
          pdfFile: {
            $ne: "",
          },
        })
          .sort({
            program: 1,
            semester: 1,
            subject: 1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Student notes fetched successfully.",
        {
          count:
            notes.length,
          notes,
        }
      );
    } catch (error) {
      console.error(
        "Get Student Notes Error:",
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
   SEARCH FACULTY NOTES
============================================================================= */

export const searchFacultyNotes =
  async (req, res) => {
    try {
      const {
        keyword,
        program,
        semester,
        subject,
      } = req.query;

      const query = {
        pdfFile: {
          $ne: "",
        },
      };

      /* ======================================
         KEYWORD SEARCH
      ====================================== */

      if (keyword) {
        query.$or = [
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
            facultyName: {
              $regex: keyword,
              $options: "i",
            },
          },
        ];
      }

      /* ======================================
         PROGRAM FILTER
      ====================================== */

      if (program) {
        query.program = program;
      }

      /* ======================================
         SEMESTER FILTER
      ====================================== */

      if (semester) {
        query.semester =
          semester;
      }

      /* ======================================
         SUBJECT FILTER
      ====================================== */

      if (subject) {
        query.subject =
          subject;
      }

      const notes =
        await FacultyNote.find(
          query
        )
          .sort({
            program: 1,
            semester: 1,
            subject: 1,
            createdAt: -1,
          })
          .lean();

      return successResponse(
        res,
        200,
        "Faculty notes fetched successfully.",
        {
          count:
            notes.length,
          notes,
        }
      );
    } catch (error) {
      console.error(
        "Search Faculty Notes Error:",
        error
      );

      return errorResponse(
        res,
        500,
        error.message
      );
    }
  };