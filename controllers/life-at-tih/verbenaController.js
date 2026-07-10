import multer from "multer";

import Verbena from "../../models/life-at-tih/Verbena.js";

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

export const uploadVerbenaImageMiddleware =
  imageUpload.single("image");

/* ==========================================================
   UPLOAD IMAGE (HERO / ABOUT / CATEGORY / HIGHLIGHT)
========================================================== */

export const uploadVerbenaImage =
  async (
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
          "verbena"
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
   CREATE OR UPDATE VERBENA
========================================================== */

export const createOrUpdateVerbena =
  async (
    req,
    res
  ) => {
    try {

      const existing =
        await Verbena.findOne();

      const filteredData =
        {};

      Object.keys(
        req.body
      ).forEach((key) => {

        const value =
          req.body[key];

        if (
          value !==
            undefined &&
          value !==
            null
        ) {

          filteredData[
            key
          ] = value;

        }

      });

      let verbena;

      if (existing) {

        verbena =
          await Verbena.findByIdAndUpdate(
            existing._id,
            {
              $set:
                filteredData,
            },
            {
              new: true,
              runValidators: true,
            }
          );

        return successResponse(
          res,
          "Verbena updated successfully.",
          verbena
        );

      }

      verbena =
        await Verbena.create(
          filteredData
        );

      return successResponse(
        res,
        "Verbena created successfully.",
        verbena,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to save Verbena."
      );

    }
  };

/* ==========================================================
   GET VERBENA
========================================================== */

export const getVerbena =
  async (
    req,
    res
  ) => {
    try {

      const verbena =
        await Verbena.findOne().lean();

      return successResponse(
        res,
        "Verbena fetched successfully.",
        verbena
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to fetch Verbena."
      );

    }
  };

/* ==========================================================
   DELETE VERBENA
========================================================== */

export const deleteVerbena =
  async (
    req,
    res
  ) => {
    try {
      const verbena = await Verbena.findOne();

if (verbena) {

  if (verbena.heroImagePublicId) {
    await deleteFromCloudinary(
      verbena.heroImagePublicId
    );
  }

  if (verbena.aboutImagePublicId) {
    await deleteFromCloudinary(
      verbena.aboutImagePublicId
    );
  }

  if (verbena.eventCategories?.length) {
    for (const item of verbena.eventCategories) {
      if (item.imagePublicId) {
        await deleteFromCloudinary(
          item.imagePublicId
        );
      }
    }
  }

  if (verbena.whyParticipate?.length) {
    for (const item of verbena.whyParticipate) {
      if (item.imagePublicId) {
        await deleteFromCloudinary(
          item.imagePublicId
        );
      }
    }
  }

}

      await Verbena.deleteMany(
        {}
      );

      return successResponse(
        res,
        "Verbena deleted successfully."
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete Verbena."
      );

    }
  };