import Mca from "../../models/academics/Mca.js";

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

const getExistingMca = async () => {
  return await Mca.findOne();
};

/* ==========================================================
   REMOVE OLD CLOUDINARY IMAGE
========================================================== */

const removeOldImage = async (
  mca
) => {
  if (!mca?.imagePublicId) return;

  await deleteFromCloudinary(
    mca.imagePublicId,
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
      "mca"
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

  updateData.mcaDescription =
    body.mcaDescription?.trim() ||
    existing?.mcaDescription ||
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

export const createOrUpdateMca =
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
        await getExistingMca();

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
          await Mca.findByIdAndUpdate(
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
          "MCA updated successfully.",
          existing
        );
      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await Mca.create(
          updateData
        );

      return successResponse(
        res,
        201,
        "MCA created successfully.",
        created
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to save MCA information.",
        error.message
      );
    }
  };
  /* ==========================================================
   GET MCA
========================================================== */

export const getMca = async (
  req,
  res
) => {
  try {

    const mca =
      await getExistingMca();

    if (!mca) {

      return successResponse(
        res,
        200,
        "MCA information not configured yet.",
        null
      );

    }

    return successResponse(
      res,
      200,
      "MCA information fetched successfully.",
      mca
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      "Failed to fetch MCA information.",
      error.message
    );

  }
};

/* ==========================================================
   REMOVE ONLY IMAGE
   (Keeps MCA Document)
========================================================== */

export const removeMcaImage =
  async (req, res) => {

    try {

      const mca =
        await getExistingMca();

      if (!mca) {

        return errorResponse(
          res,
          404,
          "MCA information not found."
        );

      }

      /* ======================================
         NO IMAGE AVAILABLE
      ====================================== */

      if (!mca.imagePublicId) {

        return successResponse(
          res,
          200,
          "No uploaded image found.",
          mca
        );

      }

      /* ======================================
         DELETE CLOUDINARY IMAGE
      ====================================== */

      await removeOldImage(
        mca
      );

      /* ======================================
         CLEAR IMAGE FIELDS
      ====================================== */

      mca.image = "";

      mca.imagePublicId = "";

      await mca.save();

      return successResponse(
        res,
        200,
        "Banner image removed successfully.",
        mca
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
   DELETE MCA CMS
   (Deletes Document + Cloudinary Image)
========================================================== */

export const deleteMca = async (
  req,
  res
) => {
  try {

    /* ======================================
       FIND DOCUMENT
    ====================================== */

    const existing =
      await getExistingMca();

    if (!existing) {

      return errorResponse(
        res,
        404,
        "MCA information not found."
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

    await Mca.findByIdAndDelete(
      existing._id
    );

    return successResponse(
      res,
      200,
      "MCA information deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      "Failed to delete MCA information.",
      error.message
    );

  }

};