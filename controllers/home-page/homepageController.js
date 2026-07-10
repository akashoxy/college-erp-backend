import mongoose from "mongoose";
import Homepage from "../../models/home-page/Homepage.js";

import {
  uploadImageToCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   Helpers
========================================================== */

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const getHomepageDocument = async () =>
  Homepage.findOne();

/* ==========================================================
   GET HOMEPAGE
========================================================== */

export const getHomepage = async (req, res) => {
  try {
    const homepage = await Homepage.findOne().lean();

    return successResponse(
      res,
      200,
      "Homepage fetched successfully.",
      homepage
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch homepage.",
      error
    );
  }
};

/* ==========================================================
   CREATE / UPDATE HOMEPAGE
========================================================== */

export const createOrUpdateHomepage = async (
  req,
  res
) => {
  try {
    const { _id, ...payload } = req.body;

    let homepage = await getHomepageDocument();

    if (homepage) {
      homepage = await Homepage.findByIdAndUpdate(
        homepage._id,
        payload,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      homepage = await Homepage.create(payload);
    }

    return successResponse(
      res,
      200,
      "Homepage saved successfully.",
      homepage
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to save homepage.",
      error
    );
  }
};

/* ==========================================================
   UPDATE HOMEPAGE
========================================================== */

export const updateHomepage = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        400,
        "Invalid homepage ID.",
      );
    }

    const homepage =
      await Homepage.findById(id);

    if (!homepage) {
      return errorResponse(
        res,
        404,
        "Homepage not found.",
        
      );
    }

    const updated =
      await Homepage.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    return successResponse(
      res,
      200,
      "Homepage updated successfully.",
      updated
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to update homepage.",
      error
    );
  }
};

/* ==========================================================
   UPLOAD SLIDER IMAGE
========================================================== */

export const uploadSliderImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return errorResponse(
        res,
        400,
        "Please select an image.",
      );
    }

    const result =
      await uploadImageToCloudinary(
        req.file,
        "homepage/sliders"
      );

    return successResponse(
      res,
      200,
      "Slider image uploaded successfully.",
      {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      }
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to upload slider image.",
      error
    );
  }
};