import Jeca from "../../models/facilities/Jeca.js";

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
   CREATE / UPDATE JECA
   (Single Document CMS)
========================================================== */

export const saveJeca = async (
  req,
  res
) => {
  let uploadedImage = null;

  try {
    const existing =
      await Jeca.findOne();

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
          "jeca/banner"
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
        await Jeca.findByIdAndUpdate(
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
        "JECA updated successfully.",
        updated
      );
    }

    /* ======================================
       CREATE
    ====================================== */

    const created =
      await Jeca.create(updateData);

    return successResponse(
      res,
      201,
      "JECA created successfully.",
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
      "Failed to save JECA.",
      error.message
    );
  }
};

/* ==========================================================
   GET JECA
========================================================== */

export const getJeca = async (
  req,
  res
) => {
  try {
    const jeca =
      await Jeca.findOne().lean();

    return successResponse(
      res,
      200,
      "JECA fetched successfully.",
      jeca
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch JECA.",
      error.message
    );
  }
};

/* ==========================================================
   DELETE JECA
========================================================== */

export const deleteJeca = async (
  req,
  res
) => {
  try {
    const existing =
      await Jeca.findOne();

    if (!existing) {
      return errorResponse(
        res,
        404,
        "JECA data not found."
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

    await Jeca.findByIdAndDelete(
      existing._id
    );

    return successResponse(
      res,
      200,
      "JECA deleted successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to delete JECA.",
      error.message
    );
  }
};