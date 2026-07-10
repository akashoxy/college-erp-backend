import Bca from "../../models/academics/Bca.js";

import {
  uploadImageToCloudinary,
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
      process.env.NODE_ENV === "development"
        ? error
        : undefined,
  });
};

/* ==========================================================
   GET EXISTING DOCUMENT
========================================================== */

const getExistingBca = async () => {
  return await Bca.findOne();
};

/* ==========================================================
   REMOVE OLD CLOUDINARY IMAGE
========================================================== */

const removeOldImage = async (
  bca
) => {
  if (!bca?.imagePublicId) return;

  await deleteFromCloudinary(
    bca.imagePublicId,
    "image"
  );
};

/* ==========================================================
   VALIDATE IMAGE
========================================================== */

const validateImage = (
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
  ];

  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return {
      valid: false,
      message:
        "Only JPG, PNG and WEBP images are allowed.",
    };
  }

  return {
    valid: true,
  };
};

/* ==========================================================
   UPLOAD IMAGE
========================================================== */

const uploadImage = async (
  file
) => {
  if (!file) return null;

  const result =
    await uploadImageToCloudinary(
      file,
      "bca"
    );

  return {
    image: result.secure_url,
    imagePublicId:
      result.public_id,
  };
};

/* ==========================================================
   BUILD UPDATE DATA
========================================================== */

const buildUpdateData = (
  body,
  existing
) => {
  const updateData = {};

  updateData.bcaDescription =
    body.bcaDescription?.trim() ||
    existing?.bcaDescription ||
    "";

  updateData.placementAssistance =
    body.placementAssistance?.trim() ||
    existing?.placementAssistance ||
    "";

  updateData.courseDetails =
    body.courseDetails?.trim() ||
    existing?.courseDetails ||
    "";

  updateData.duration =
    body.duration?.trim() ||
    existing?.duration ||
    "";

  updateData.eligibility =
    body.eligibility?.trim() ||
    existing?.eligibility ||
    "";

  updateData.objectives =
    body.objectives
      ? JSON.parse(body.objectives)
      : existing?.objectives || [];

  updateData.valueAddedPrograms =
    body.valueAddedPrograms
      ? JSON.parse(
          body.valueAddedPrograms
        )
      : existing?.valueAddedPrograms ||
        [];

  updateData.jobProspects =
    body.jobProspects
      ? JSON.parse(
          body.jobProspects
        )
      : existing?.jobProspects ||
        [];

  return updateData;
};

/* ==========================================================
   CREATE / UPDATE
========================================================== */

export const createOrUpdateBca =
  async (req, res) => {
    try {
      const image =
        req.files?.image?.[0] ||
        req.file;

      const validation =
        validateImage(image);

      if (!validation.valid) {
        return errorResponse(
          res,
          400,
          validation.message
        );
      }

      let existing =
        await getExistingBca();

      const updateData =
        buildUpdateData(
          req.body,
          existing
        );

      /* ======================================
         NEW IMAGE
      ====================================== */

      if (image) {
        if (
          existing?.imagePublicId
        ) {
          await removeOldImage(
            existing
          );
        }

        const uploaded =
          await uploadImage(
            image
          );

        Object.assign(
          updateData,
          uploaded
        );
      } else {
        updateData.image =
          existing?.image || "";

        updateData.imagePublicId =
          existing?.imagePublicId ||
          "";
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
        updateData.image =
          req.body.image;

        updateData.imagePublicId =
          "";
      }

      /* ======================================
         UPDATE
      ====================================== */

      if (existing) {
        existing =
          await Bca.findByIdAndUpdate(
            existing._id,
            updateData,
            {
              new: true,
              runValidators: true,
            }
          );

        return successResponse(
          res,
          200,
          "BCA updated successfully.",
          existing
        );
      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await Bca.create(
          updateData
        );

      return successResponse(
        res,
        201,
        "BCA created successfully.",
        created
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to save BCA information.",
        error.message
      );
    }
  };
  /* ==========================================================
   GET BCA
========================================================== */

export const getBca = async (
  req,
  res
) => {
  try {

    const bca =
      await getExistingBca();

    if (!bca) {

      return successResponse(
        res,
        200,
        "BCA information not configured yet.",
        null
      );

    }

    return successResponse(
      res,
      200,
      "BCA information fetched successfully.",
      bca
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      "Failed to fetch BCA information.",
      error.message
    );

  }
};

/* ==========================================================
   REMOVE ONLY IMAGE
   (Keeps BCA Document)
========================================================== */

export const removeBcaImage =
  async (req, res) => {

    try {

      const bca =
        await getExistingBca();

      if (!bca) {

        return errorResponse(
          res,
          404,
          "BCA information not found."
        );

      }

      /* ======================================
         NO IMAGE AVAILABLE
      ====================================== */

      if (!bca.imagePublicId) {

        return successResponse(
          res,
          200,
          "No uploaded image found.",
          bca
        );

      }

      /* ======================================
         DELETE CLOUDINARY IMAGE
      ====================================== */

      await removeOldImage(
        bca
      );

      /* ======================================
         CLEAR IMAGE FIELDS
      ====================================== */

      bca.image = "";

      bca.imagePublicId = "";

      await bca.save();

      return successResponse(
        res,
        200,
        "Banner image removed successfully.",
        bca
      );

    } catch (error) {

      return errorResponse(
        res,
        500,
        "Failed to remove banner image.",
        error.message
      );

    }

  };
  /* ==========================================================
   DELETE BCA CMS
   (Deletes Document + Cloudinary Image)
========================================================== */

export const deleteBca = async (
  req,
  res
) => {
  try {

    /* ======================================
       FIND DOCUMENT
    ====================================== */

    const existing =
      await getExistingBca();

    if (!existing) {

      return errorResponse(
        res,
        404,
        "BCA information not found."
      );

    }

    /* ======================================
       DELETE CLOUDINARY IMAGE
    ====================================== */

    if (existing.imagePublicId) {

      await removeOldImage(
        existing
      );

    }

    /* ======================================
       DELETE DOCUMENT
    ====================================== */

    await Bca.findByIdAndDelete(
      existing._id
    );

    return successResponse(
      res,
      200,
      "BCA information deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      "Failed to delete BCA information.",
      error.message
    );

  }

};