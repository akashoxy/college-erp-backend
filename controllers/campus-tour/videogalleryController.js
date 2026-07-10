import VideoGallery from "../../models/campus-tour/Videogallery.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   CREATE OR UPDATE VIDEO GALLERY
========================================================== */

export const createOrUpdateVideoGallery =
  async (
    req,
    res
  ) => {
    try {

      const existing =
        await VideoGallery.findOne();

      const filteredData =
        {};

      Object.keys(
        req.body
      ).forEach((key) => {

        if (
          req.body[key] !==
            undefined &&
          req.body[key] !==
            null
        ) {

          filteredData[
            key
          ] =
            req.body[key];

        }

      });

      let gallery;

      if (existing) {

        gallery =
          await VideoGallery.findByIdAndUpdate(
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
          "Video Gallery updated successfully.",
          gallery
        );

      }

      gallery =
        await VideoGallery.create(
          filteredData
        );

      return successResponse(
        res,
        "Video Gallery created successfully.",
        gallery,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to save Video Gallery."
      );

    }
  };

/* ==========================================================
   GET VIDEO GALLERY
========================================================== */

export const getVideoGallery =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await VideoGallery.findOne().lean();

      return successResponse(
        res,
        "Video Gallery fetched successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to fetch Video Gallery."
      );

    }
  };

/* ==========================================================
   DELETE VIDEO GALLERY
========================================================== */

export const deleteVideoGallery =
  async (
    req,
    res
  ) => {
    try {

      await VideoGallery.deleteMany();

      return successResponse(
        res,
        "Video Gallery deleted successfully."
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete Video Gallery."
      );

    }
  };
  