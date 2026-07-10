import AcademicCalendar from "../../models/academics/AcademicCalendar.js";

import {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  deleteFileFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

// ==========================================================
// RESPONSE HELPERS
// ==========================================================

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

// ==========================================================
// GET EXISTING CMS DOCUMENT
// ==========================================================

const getExistingCalendar = async () => {
  return await AcademicCalendar.findOne();
};

// ==========================================================
// DELETE OLD CLOUDINARY FILE
// ==========================================================

const removeOldCloudinaryFile = async (
  calendar
) => {
  if (!calendar?.publicId) return;

  await deleteFileFromCloudinary(
    calendar.publicId,
    calendar.fileType === "pdf"
      ? "raw"
      : "image"
  );
};

// ==========================================================
// UPLOAD FILE
// ==========================================================

const uploadCalendarFile = async (
  file
) => {
  if (!file) return null;

  if (
    file.mimetype ===
    "application/pdf"
  ) {
    const result =
      await uploadPdfToCloudinary(
        file,
        "academic-calendar"
      );

    return {
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType: "pdf",
    };
  }

  const result =
    await uploadImageToCloudinary(
      file,
      "academic-calendar"
    );

  return {
    fileUrl: result.secure_url,
    publicId: result.public_id,
    fileType: "image",
  };
};

// ==========================================================
// CREATE UPDATE OBJECT
// ==========================================================

const buildUpdateData = (
  body,
  calendar
) => {
  return {
    redirectUrl:
      body.redirectUrl?.trim() ||
      calendar?.redirectUrl ||
      "",
  };
};

// ==========================================================
// VALIDATE FILE
// ==========================================================

const validateUploadedFile = (
  file
) => {
  if (!file) {
    return {
      valid: true,
    };
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return {
      valid: false,
      message:
        "Only JPG, PNG, WEBP and PDF files are allowed.",
    };
  }

  return {
    valid: true,
  };
};

// ==========================================================
// CONTROLLERS START HERE
// ==========================================================
/* ==========================================
   CREATE / UPDATE ACADEMIC CALENDAR
   (Single Document CMS)
========================================== */

export const saveAcademicCalendar = async (
  req,
  res
) => {
  try {

    // ======================================================
    // VALIDATE FILE
    // ======================================================

    const validation =
      validateUploadedFile(req.file);

    if (!validation.valid) {
      return errorResponse(
        res,
        400,
        validation.message
      );
    }

    // ======================================================
    // FIND EXISTING DOCUMENT
    // ======================================================

    let calendar =
      await getExistingCalendar();

    // ======================================================
    // CREATE UPDATE DATA
    // ======================================================

    const updateData =
      buildUpdateData(
        req.body,
        calendar
      );

    // ======================================================
    // UPLOAD NEW FILE
    // ======================================================

    if (req.file) {

      // Delete previous Cloudinary file

      if (calendar?.publicId) {
        await removeOldCloudinaryFile(
          calendar
        );
      }

      const uploadedFile =
        await uploadCalendarFile(
          req.file
        );

      Object.assign(
        updateData,
        uploadedFile
      );

    } else {

      // Preserve previous file

     updateData.fileUrl =
  calendar?.fileUrl ?? null;

updateData.publicId =
  calendar?.publicId ?? null;

updateData.fileType =
  calendar?.fileType ?? null;

    }

    // ======================================================
    // UPDATE EXISTING
    // ======================================================

    if (calendar) {

      calendar =
        await AcademicCalendar.findByIdAndUpdate(

          calendar._id,

          updateData,

          {

           new: true,

            runValidators: true,

          }

        );

      return successResponse(

        res,

        200,

        "Academic Calendar updated successfully.",

        calendar

      );

    }

    // ======================================================
    // CREATE NEW DOCUMENT
    // ======================================================

    calendar =
      await AcademicCalendar.create(
        updateData
      );

    return successResponse(

      res,

      201,

      "Academic Calendar created successfully.",

      calendar

    );

  } catch (error) {

    return errorResponse(

      res,

      500,

      "Failed to save Academic Calendar.",

      error.message

    );

  }

};
/* ==========================================
   GET ACADEMIC CALENDAR
========================================== */

export const getAcademicCalendar = async (
  req,
  res
) => {
  try {

    const calendar =
      await getExistingCalendar();

    if (!calendar) {

      return successResponse(
        res,
        200,
        "Academic Calendar not configured yet.",
        null
      );

    }

    return successResponse(
      res,
      200,
      "Academic Calendar fetched successfully.",
      calendar
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      "Failed to fetch Academic Calendar.",
      error.message
    );

  }
};

/* ==========================================
   REMOVE ONLY CLOUDINARY FILE
   (Keeps CMS Document)
========================================== */

export const removeAcademicCalendarFile =
  async (req, res) => {

    try {

      const calendar =
        await getExistingCalendar();

      if (!calendar) {

        return errorResponse(
          res,
          404,
          "Academic Calendar not found."
        );

      }

      // Nothing uploaded

      if (!calendar.publicId) {

        return successResponse(
          res,
          200,
          "No uploaded file found.",
          calendar
        );

      }

      // Delete Cloudinary Asset

      await removeOldCloudinaryFile(
        calendar
      );

      // Clear Upload Information
      // Keep Redirect URL

       calendar.fileUrl = null;
calendar.publicId = null;
calendar.fileType = null;

await calendar.save();
      return successResponse(
        res,
        200,
        "Academic Calendar file removed successfully.",
        calendar
      );

    } catch (error) {

     return errorResponse(
  res,
  500,
  "Failed to remove Academic Calendar file.",
  error.message
);

  return errorResponse(
    res,
    500,
    "Failed to remove Academic Calendar file.",
    error.message
  );

    }

  };
  /* ==========================================
   DELETE ENTIRE ACADEMIC CALENDAR CMS
   (Deletes Document + Cloudinary File)
========================================== */

export const deleteAcademicCalendar = async (
  req,
  res
) => {
  try {

    // ======================================================
    // FIND DOCUMENT
    // ======================================================

    const calendar =
      await getExistingCalendar();

    if (!calendar) {

      return errorResponse(
        res,
        404,
        "Academic Calendar not found."
      );

    }

    // ======================================================
    // DELETE CLOUDINARY FILE
    // ======================================================

    if (calendar.publicId) {

      await removeOldCloudinaryFile(
        calendar
      );

    }

    // ======================================================
    // DELETE DOCUMENT
    // ======================================================

    await AcademicCalendar.findByIdAndDelete(
      calendar._id
    );

    return successResponse(
      res,
      200,
      "Academic Calendar deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      "Failed to delete Academic Calendar.",
      error.message
    );

  }

};

/* ==========================================================
   EXPORTS
========================================================== */

export default {
  saveAcademicCalendar,
  getAcademicCalendar,
  removeAcademicCalendarFile,
  deleteAcademicCalendar,
};