import mongoose from "mongoose";

import Approval from "../../models/home-page/Approval.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary
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

const findApproval = (id) =>
  Approval.findById(id);

/* ==========================================================
   CREATE APPROVAL
========================================================== */

export const createApproval = async (
  req,
  res
) => {
  try {
    const {
      title,
      websiteLink,
    } = req.body;

    let logo = "";
    let publicId = "";

    if (req.file) {
      const result =
        await uploadImageToCloudinary(
          req.file,
          "approvals"
        );

      logo = result.secure_url;
      publicId = result.public_id;
    }

    const approval =
      await Approval.create({
        title,
        websiteLink,
        logo,
        publicId,
      });

    return successResponse(
      res,
      201,
      "Approval created successfully.",
       approval
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to create approval.",
        error
    );
  }
};

/* ==========================================================
   GET ALL APPROVALS
========================================================== */

export const getApprovals = async (
  req,
  res
) => {
  try {
    const approvals =
      await Approval.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return successResponse(
      res,
      200,
      "Approvals fetched successfully.",
      {
        count: approvals.length,
        approvals,
      }
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to fetch approvals.",
        error
    );
  }
};

/* ==========================================================
   GET SINGLE APPROVAL
========================================================== */

export const getApprovalById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return errorResponse(
          res,
          400,
          "Invalid approval ID.",
        );
      }

      const approval =
        await findApproval(
          id
        ).lean();

      if (!approval) {
        return errorResponse(
          res,
          404,
          "Approval not found.",
          
        );
      }

      return successResponse(
        res,
        200,
        "Approval fetched successfully.",
         approval
        
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        error.message ||
          "Failed to fetch approval.",
          error
      );
    }
  };


/* ==========================================================
   UPDATE APPROVAL
========================================================== */

export const updateApproval = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        400,
        "Invalid approval ID.",
      );
    }

    const approval =
      await findApproval(id);

    if (!approval) {
      return errorResponse(
        res,
        404,
        "Approval not found.",
        
      );
    }

    const {
      title,
      websiteLink,
    } = req.body;

    approval.title =
      title ?? approval.title;

    approval.websiteLink =
      websiteLink ??
      approval.websiteLink;

    /* ==========================
       LOGO UPDATE
    ========================== */

    if (req.file) {
      if (approval.publicId) {
        await deleteFromCloudinary(
          approval.publicId
        );
      }

      const result =
        await uploadImageToCloudinary(
          req.file,
          "approvals"
        );

      approval.logo =
        result.secure_url;

      approval.publicId =
        result.public_id;
    }

    await approval.save();

    return successResponse(
      res,
      200,
      "Approval updated successfully.",
      approval
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to update approval.",
        error
    );
  }
};

/* ==========================================================
   DELETE APPROVAL
========================================================== */

export const deleteApproval = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        400,
        "Invalid approval ID.",
        
      );
    }

    const approval =
      await findApproval(id);

    if (!approval) {
      return errorResponse(
        res,
        404,
        "Approval not found.",
        
      );
    }

    if (approval.publicId) {
      await deleteFromCloudinary(
        approval.publicId
      );
    }

    await approval.deleteOne();

    return successResponse(
      res,
      200,
      "Approval deleted successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      error.message ||
        "Failed to delete approval.",
        error
    );
  }
};

/* ==========================================================
   DELETE ALL APPROVALS
========================================================== */

export const deleteAllApprovals =
  async (req, res) => {
    try {
      const approvals =
        await Approval.find().lean();

      await Promise.all(
        approvals
          .filter(
            (approval) =>
              approval.publicId
          )
          .map((approval) =>
            deleteFromCloudinary(
              approval.publicId
            )
          )
      );

      await Approval.deleteMany({});

      return successResponse(
        res,
        200,
        "All approvals deleted successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        error.message ||
          "Failed to delete approvals.",
          error
      );
    }
  };