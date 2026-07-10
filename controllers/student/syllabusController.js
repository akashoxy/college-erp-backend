import Syllabus from "../../models/student/Syllabus.js";

import {
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

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

  const semesterNumber =
    Number(semester);

  if (
    Number.isNaN(
      semesterNumber
    )
  ) {

    return "Semester must be a valid number.";

  }

  switch (stream) {

    case "MCA":

      if (
        semesterNumber < 1 ||
        semesterNumber > 4
      ) {

        return "MCA has only 4 semesters.";

      }

      break;

    case "BCA":

    case "BBA":

      if (
        semesterNumber < 1 ||
        semesterNumber > 8
      ) {

        return `${stream} has only 8 semesters.`;

      }

      break;

    default:

      return "Invalid stream.";

  }

  return null;

};

/* ==========================================================================
   GET ALL SYLLABUS
============================================================================= */

export const getSyllabus = async (
  req,
  res
) => {

  try {

    const syllabus =
      await Syllabus.find()

        .sort({

          stream: 1,

          semester: 1,

          syllabusType: 1,

        });

    return successResponse(

      res,

      "Syllabus fetched successfully.",

      syllabus

    );

  } catch (error) {

    console.error(

      "GET SYLLABUS ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to fetch syllabus.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   CREATE / UPDATE SYLLABUS
============================================================================= */

export const createOrUpdateSyllabus =
  async (
    req,
    res
  ) => {

    try {

      const {

        stream,
        semester,
        syllabusType,

      } = req.body;

      /* =====================================================
         VALIDATION
      ====================================================== */

      if (

        !stream ||

        !semester ||

        !syllabusType

      ) {

        return errorResponse(

          res,

          "Stream, semester and syllabus type are required.",

          400

        );

      }

      const validationError =
        validateSemester(

          stream,

          semester

        );

      if (validationError) {

        return errorResponse(

          res,

          validationError,

          400

        );

      }

      if (!req.file) {

        return errorResponse(

          res,

          "PDF file is required.",

          400

        );

      }

      /* =====================================================
         CHECK EXISTING RECORD
      ====================================================== */

      const existing =
        await Syllabus.findOne({

          stream,

          semester,

          syllabusType,

        });

      /* =====================================================
         DELETE OLD PDF
      ====================================================== */

      if (

        existing?.publicId

      ) {

        await deleteFromCloudinary(

          existing.publicId,

          "raw"

        );

      }

      /* =====================================================
         UPLOAD NEW PDF
      ====================================================== */

      const uploaded =
        await uploadPdfToCloudinary(

          req.file,

          "syllabus"

        );

      /* =====================================================
         CREATE / UPDATE
      ====================================================== */

      const syllabus =
        await Syllabus.findOneAndUpdate(

          {

            stream,

            semester,

            syllabusType,

          },

          {

            stream,

            semester,

            syllabusType,

            pdfFile:
              uploaded.secure_url,

            publicId:
              uploaded.public_id,

          },

          {

            new: true,

            upsert: true,

            runValidators: true,

          }

        );

      return successResponse(

        res,

        existing

          ? "Syllabus updated successfully."

          : "Syllabus created successfully.",

        syllabus

      );

    } catch (error) {

      console.error(

        "CREATE / UPDATE SYLLABUS ERROR:",

        error

      );

      return errorResponse(

        res,

        "Failed to save syllabus.",

        500,

        error.message

      );

    }

  };
  /* ==========================================================================
   DELETE SYLLABUS
============================================================================= */

export const deleteSyllabus = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!id) {

      return errorResponse(

        res,

        "Syllabus ID is required.",

        400

      );

    }

    /* =====================================================
       FIND SYLLABUS
    ====================================================== */

    const syllabus =
      await Syllabus.findById(
        id
      );

    if (!syllabus) {

      return errorResponse(

        res,

        "Syllabus not found.",

        404

      );

    }

    /* =====================================================
       DELETE CLOUDINARY PDF
    ====================================================== */

    if (

      syllabus.publicId

    ) {

      await deleteFromCloudinary(

        syllabus.publicId,

        "raw"

      );

    }

    /* =====================================================
       DELETE DOCUMENT
    ====================================================== */

    await syllabus.deleteOne();

    return successResponse(

      res,

      "Syllabus deleted successfully."

    );

  } catch (error) {

    console.error(

      "DELETE SYLLABUS ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to delete syllabus.",

      500,

      error.message

    );

  }

};
/* ==========================================================================
   GET STREAM SYLLABUS
============================================================================= */

export const getStreamSyllabus = async (
  req,
  res
) => {

  try {

    const { stream } =
      req.params;

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!stream) {

      return errorResponse(

        res,

        "Stream is required.",

        400

      );

    }

    const allowedStreams = [

      "BCA",

      "BBA",

      "MCA",

    ];

    if (

      !allowedStreams.includes(
        stream
      )

    ) {

      return errorResponse(

        res,

        "Invalid stream.",

        400

      );

    }

    /* =====================================================
       GET STREAM SYLLABUS
    ====================================================== */

    const syllabus =
      await Syllabus.find({

        stream,

      })

        .sort({

          semester: 1,

          syllabusType: 1,

        });

    return successResponse(

      res,

      `${stream} syllabus fetched successfully.`,

      syllabus

    );

  } catch (error) {

    console.error(

      "GET STREAM SYLLABUS ERROR:",

      error

    );

    return errorResponse(

      res,

      "Failed to fetch stream syllabus.",

      500,

      error.message

    );

  }

};