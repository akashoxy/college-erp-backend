import WebMagazine from "../../models/facilities/Webmagazine.js";

import {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

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
      process.env.NODE_ENV ===
      "development"
        ? error
        : undefined,
  });
};

/* ==========================================================
   CREATE MAGAZINE
========================================================== */

export const createMagazine =
  async (req, res) => {

    let uploadedImage = null;

    let uploadedPdf = null;

    try {

      const payload = {};

      /* ======================================
         TEXT FIELDS
      ====================================== */

      payload.title =
        req.body.title?.trim() || "";

      payload.subtitle =
        req.body.subtitle?.trim() || "";

      payload.author =
        req.body.author?.trim() || "";

      payload.category =
        req.body.category?.trim() || "";

      payload.edition =
        req.body.edition?.trim() || "";

      payload.publicationDate =
        req.body.publicationDate ||
        null;

      payload.year =
        Number(req.body.year) ||
        new Date().getFullYear();

      /* ======================================
         IMAGE URL SUPPORT
      ====================================== */

      if (
        req.body.image &&
        req.body.image.startsWith(
          "http"
        )
      ) {

        payload.image =
          req.body.image;

        payload.imagePublicId =
          "";

      }

      /* ======================================
         CLOUDINARY IMAGE
      ====================================== */

      else if (
        req.files?.image?.length > 0
      ) {

        uploadedImage =
          await uploadImageToCloudinary(

            req.files.image[0],

            "web-magazine/images"

          );

        payload.image =
          uploadedImage.secure_url;

        payload.imagePublicId =
          uploadedImage.public_id;

      }

      else {

        payload.image = "";

        payload.imagePublicId =
          "";

      }

      /* ======================================
         PDF URL SUPPORT
      ====================================== */

      if (
        req.body.pdfFile &&
        req.body.pdfFile.startsWith(
          "http"
        )
      ) {

        payload.pdfFile =
          req.body.pdfFile;

        payload.pdfPublicId =
          "";

      }

      /* ======================================
         CLOUDINARY PDF
      ====================================== */

      else if (
        req.files?.pdfFile?.length >
        0
      ) {

        uploadedPdf =
          await uploadPdfToCloudinary(

            req.files.pdfFile[0],

            "web-magazine/pdfs"

          );

        payload.pdfFile =
          uploadedPdf.secure_url;

        payload.pdfPublicId =
          uploadedPdf.public_id;

      }

      else {

        payload.pdfFile = "";

        payload.pdfPublicId =
          "";

      }

      /* ======================================
         CREATE
      ====================================== */

    const magazine = await WebMagazine.create(payload);

return successResponse(
  res,
  201,
  "Magazine created successfully.",
  magazine
);

} catch (error) {

  /* ======================================
     CLEANUP IMAGE
  ====================================== */

  if (uploadedImage?.public_id) {
    try {
      await deleteFromCloudinary(
        uploadedImage.public_id,
        "image"
      );
    } catch {}
  }

  /* ======================================
     CLEANUP PDF
  ====================================== */

  if (uploadedPdf?.public_id) {
    try {
      await deleteFromCloudinary(
        uploadedPdf.public_id,
        "raw"
      );
    } catch {}
  }

  return errorResponse(
    res,
    500,
    "Failed to create magazine.",
    error.message
  );
}

  };
  /* ==========================================================
   GET ALL MAGAZINES
========================================================== */

export const getMagazines =
  async (req, res) => {
    try {

      const magazines =
        await WebMagazine.find()

          .sort({

            year: -1,

            publicationDate: -1,

            createdAt: -1,

          })

          .lean();

      return successResponse(

        res,

        200,

        "Magazines fetched successfully.",

        magazines

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to fetch magazines.",

        error.message

      );

    }
  };

/* ==========================================================
   GET SINGLE MAGAZINE
========================================================== */

export const getMagazineById =
  async (req, res) => {
    try {

      const magazine =
        await WebMagazine.findById(

          req.params.id

        ).lean();

      if (!magazine) {

        return errorResponse(

          res,

          404,

          "Magazine not found."

        );

      }

      return successResponse(

        res,

        200,

        "Magazine fetched successfully.",

        magazine

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to fetch magazine.",

        error.message

      );

    }
  };
  /* ==========================================================
   UPDATE MAGAZINE
========================================================== */

export const updateMagazine =
  async (req, res) => {

    let uploadedImage = null;

    let uploadedPdf = null;

    try {

      const existing =
        await WebMagazine.findById(
          req.params.id
        );

      if (!existing) {

        return errorResponse(

          res,

          404,

          "Magazine not found."

        );

      }

      const updateData = {};

      /* ======================================
         TEXT FIELDS
      ====================================== */

      if (
        req.body.title !==
        undefined
      ) {

        updateData.title =
          req.body.title.trim();

      }

      if (
        req.body.subtitle !==
        undefined
      ) {

        updateData.subtitle =
          req.body.subtitle.trim();

      }

      if (
        req.body.author !==
        undefined
      ) {

        updateData.author =
          req.body.author.trim();

      }

      if (
        req.body.category !==
        undefined
      ) {

        updateData.category =
          req.body.category.trim();

      }

      if (
        req.body.edition !==
        undefined
      ) {

        updateData.edition =
          req.body.edition.trim();

      }

      if (
        req.body.publicationDate !==
        undefined
      ) {

        updateData.publicationDate =
          req.body.publicationDate ||
          null;

      }

      if (
        req.body.year !==
        undefined
      ) {

        updateData.year =
          Number(req.body.year);

      }

      /* ======================================
         IMAGE URL SUPPORT
      ====================================== */

      if (
        req.body.image &&
        req.body.image.startsWith(
          "http"
        )
      ) {

        if (
          existing.imagePublicId
        ) {

          await deleteFromCloudinary(

            existing.imagePublicId,

            "image"

          );

        }

        updateData.image =
          req.body.image;

        updateData.imagePublicId =
          "";

      }

      /* ======================================
         IMAGE UPLOAD
      ====================================== */

      else if (
        req.files?.image?.length > 0
      ) {

        uploadedImage =
          await uploadImageToCloudinary(

            req.files.image[0],

            "web-magazine/images"

          );

        if (
          existing.imagePublicId
        ) {

          await deleteFromCloudinary(

            existing.imagePublicId,

            "image"

          );

        }

        updateData.image =
          uploadedImage.secure_url;

        updateData.imagePublicId =
          uploadedImage.public_id;

      }

      /* ======================================
         PDF URL SUPPORT
      ====================================== */

      if (
        req.body.pdfFile &&
        req.body.pdfFile.startsWith(
          "http"
        )
      ) {

        if (
          existing.pdfPublicId
        ) {

          await deleteFromCloudinary(

            existing.pdfPublicId,

            "raw"

          );

        }

        updateData.pdfFile =
          req.body.pdfFile;

        updateData.pdfPublicId =
          "";

      }

      /* ======================================
         PDF UPLOAD
      ====================================== */

      else if (
        req.files?.pdfFile?.length >
        0
      ) {

        uploadedPdf =
          await uploadPdfToCloudinary(

            req.files.pdfFile[0],

            "web-magazine/pdfs"

          );

        if (
          existing.pdfPublicId
        ) {

          await deleteFromCloudinary(

            existing.pdfPublicId,

            "raw"

          );

        }

        updateData.pdfFile =
          uploadedPdf.secure_url;

        updateData.pdfPublicId =
          uploadedPdf.public_id;

      }

      /* ======================================
         UPDATE
      ====================================== */

      const updated =
        await WebMagazine.findByIdAndUpdate(

          req.params.id,

          {
            $set: updateData,
          },

          {
            new: true,
            runValidators: true,
          }

        );

      return successResponse(

        res,

        200,

        "Magazine updated successfully.",

        updated

      );

    } catch (error) {

      /* ======================================
         CLEANUP FAILED UPLOADS
      ====================================== */

      if (
        uploadedImage?.public_id
      ) {

        try {

          await deleteFromCloudinary(

            uploadedImage.public_id,

            "image"

          );

        } catch {}

      }

      if (
        uploadedPdf?.public_id
      ) {

        try {

          await deleteFromCloudinary(

            uploadedPdf.public_id,

            "raw"

          );

        } catch {}

      }

      return errorResponse(

        res,

        500,

        "Failed to update magazine.",

        error.message

      );

    }

  };
  /* ==========================================================
   DELETE MAGAZINE
========================================================== */

export const deleteMagazine =
  async (req, res) => {
    try {

      const magazine =
        await WebMagazine.findById(
          req.params.id
        );

      if (!magazine) {

        return errorResponse(

          res,

          404,

          "Magazine not found."

        );

      }

      /* ======================================
         DELETE IMAGE
      ====================================== */

      if (
        magazine.imagePublicId
      ) {

        try {

          await deleteFromCloudinary(

            magazine.imagePublicId,

            "image"

          );

        } catch {}

      }

      /* ======================================
         DELETE PDF
      ====================================== */

      if (
        magazine.pdfPublicId
      ) {

        try {

          await deleteFromCloudinary(

            magazine.pdfPublicId,

            "raw"

          );

        } catch {}

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await WebMagazine.findByIdAndDelete(
        req.params.id
      );

      return successResponse(

        res,

        200,

        "Magazine deleted successfully."

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete magazine.",

        error.message

      );

    }
  };