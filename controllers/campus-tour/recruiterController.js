import Recruiter from "../../models/campus-tour/Recruiter.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   CREATE RECRUITER
========================================================== */

export const createRecruiter = async (
  req,
  res
) => {
  try {

    let logo = "";
    let logoPublicId = "";

    if (req.file) {

      const result =
        await uploadImageToCloudinary(
          req.file,
          "recruiters"
        );

      logo =
        result.secure_url;

      logoPublicId =
        result.public_id;

    }

    const recruiter =
      await Recruiter.create({
        companyName:
          req.body.companyName,
        website:
          req.body.website,
        logo,
        logoPublicId,
      });

    return successResponse(
  res,
  201,
  "Recruiter created successfully.",
  {
    recruiter,
  }
);

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to create recruiter."
    );

  }
};

/* ==========================================================
   GET ALL RECRUITERS
========================================================== */
export const getRecruiters = async (
  req,
  res
) => {
  try {

    const recruiters =
      await Recruiter.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return successResponse(
      res,
      200,
      "Recruiters fetched successfully.",
      {
        count: recruiters.length,
        recruiters,
      }
    );

  } catch (error) {

    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to fetch recruiters.",
      error
    );

  }
};


/* ==========================================================
   GET RECRUITER BY ID
========================================================== */

export const getRecruiterById = async (
  req,
  res
) => {
  try {

    const recruiter =
      await Recruiter.findById(
        req.params.id
      ).lean();

    if (!recruiter) {
      return errorResponse(
        res,
        "Recruiter not found.",
        404
      );
    }

    return successResponse(
      res,
      "Recruiter fetched successfully.",
      recruiter
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to fetch recruiter."
    );

  }
};

/* ==========================================================
   UPDATE RECRUITER
========================================================== */

export const updateRecruiter = async (
  req,
  res
) => {
  try {

    const recruiter =
      await Recruiter.findById(
        req.params.id
      );

    if (!recruiter) {
      return errorResponse(
        res,
        "Recruiter not found.",
        404
      );
    }

    Object.assign(
      recruiter,
      req.body
    );

    if (req.file) {

      if (
        recruiter.logoPublicId
      ) {
        await deleteFromCloudinary(
          recruiter.logoPublicId,
          "image"
        );
      }

      const result =
        await uploadImageToCloudinary(
          req.file,
          "recruiters"
        );

      recruiter.logo =
        result.secure_url;

      recruiter.logoPublicId =
        result.public_id;

    }

    await recruiter.save();

    return successResponse(
      res,
      "Recruiter updated successfully.",
      recruiter
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to update recruiter."
    );

  }
};

/* ==========================================================
   DELETE RECRUITER
========================================================== */

export const deleteRecruiter = async (
  req,
  res
) => {
  try {

    const recruiter =
      await Recruiter.findById(
        req.params.id
      );

    if (!recruiter) {
      return errorResponse(
        res,
        "Recruiter not found.",
        404
      );
    }

    if (
      recruiter.logoPublicId
    ) {
      await deleteFromCloudinary(
        recruiter.logoPublicId,
        "image"
      );
    }

    await recruiter.deleteOne();

    return successResponse(
      res,
      "Recruiter deleted successfully."
    );

  } catch (error) {

    return errorResponse(
      res,
      error.message ||
        "Failed to delete recruiter."
    );

  }
};