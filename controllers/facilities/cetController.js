import Cet from "../../models/facilities/Cet.js";

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
   CREATE / UPDATE CET
   (Single Document CMS)
========================================================== */

export const saveCet = async (
  req,
  res
) => {
  let uploadedImage = null;

  try {
    const existing =
      await Cet.findOne();

    const updateData = {};

    /* ======================================
       PARAGRAPH
    ====================================== */

    if (
      req.body.paragraph !==
      undefined
    ) {
      updateData.paragraph =
        req.body.paragraph.trim();
    } else {
      updateData.paragraph =
        existing?.paragraph || "";
    }

    /* ======================================
       CLOUDINARY IMAGE
    ====================================== */

    if (req.file) {
      uploadedImage =
        await uploadImageToCloudinary(
          req.file,
          "cet/banner"
        );

      if (
        existing?.bannerImagePublicId
      ) {
        await deleteFromCloudinary(
          existing.bannerImagePublicId,
          "image"
        );
      }

      updateData.bannerImage =
        uploadedImage.secure_url;

      updateData.bannerImagePublicId =
        uploadedImage.public_id;
    }

    /* ======================================
       IMAGE URL SUPPORT
    ====================================== */

    else if (
      req.body.bannerImage &&
      req.body.bannerImage.startsWith(
        "http"
      )
    ) {
      if (
        existing?.bannerImagePublicId
      ) {
        await deleteFromCloudinary(
          existing.bannerImagePublicId,
          "image"
        );
      }

      updateData.bannerImage =
        req.body.bannerImage;

      updateData.bannerImagePublicId =
        "";
    }

    /* ======================================
       KEEP EXISTING IMAGE
    ====================================== */

    else {
      updateData.bannerImage =
        existing?.bannerImage || "";

      updateData.bannerImagePublicId =
        existing?.bannerImagePublicId ||
        "";
    }

    /* ======================================
       UPDATE
    ====================================== */

    if (existing) {
      const updated =
  await Cet.findByIdAndUpdate(
    existing._id,
    {
      $set: updateData,
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

      return successResponse(
        res,
        200,
        "CET updated successfully.",
        updated
      );
    }

    /* ======================================
       CREATE
    ====================================== */

    const created =
      await Cet.create(updateData);

    return successResponse(
      res,
      201,
      "CET created successfully.",
      created
    );
  } catch (error) {
    /* ======================================
       CLEANUP FAILED IMAGE
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

    return errorResponse(
      res,
      500,
      "Failed to save CET.",
      error.message
    );
  }
};

/* ==========================================================
   GET CET
========================================================== */

export const getCet = async (
  req,
  res
) => {
  try {
    const cet =
      await Cet.findOne().lean();

    return successResponse(
      res,
      200,
      "CET fetched successfully.",
      cet
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch CET.",
      error.message
    );
  }
};

/* ==========================================================
   DELETE CET
========================================================== */

export const deleteCet = async (
  req,
  res
) => {
  try {
    const existing =
      await Cet.findOne();

    if (!existing) {
      return errorResponse(
        res,
        404,
        "CET data not found."
      );
    }

    /* ======================================
       DELETE CLOUDINARY IMAGE
    ====================================== */

    if (
      existing.bannerImagePublicId
    ) {
      try {
        await deleteFromCloudinary(
          existing.bannerImagePublicId,
          "image"
        );
      } catch {}
    }

    /* ======================================
       DELETE DOCUMENT
    ====================================== */

    await Cet.findByIdAndDelete(
      existing._id
    );

    return successResponse(
      res,
      200,
      "CET deleted successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to delete CET.",
      error.message
    );
  }
};