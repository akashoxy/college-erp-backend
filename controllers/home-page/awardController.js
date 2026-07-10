import mongoose from "mongoose";

import Award from "../../models/home-page/Award.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
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

const findAward = (id) =>
  Award.findById(id);

/* ==========================================================
   CREATE AWARD
========================================================== */

export const createAward = async (req, res) => {
  try {
    const {
      title,
      recipient,
      awardee,
      awardDate,
      description,
      featured,
    } = req.body;

    let image = "";
    let publicId = "";

    if (req.file) {
      const result =
        await uploadImageToCloudinary(
          req.file,
          "awards"
        );

      image = result.secure_url;
      publicId = result.public_id;
    }

    const award = await Award.create({
      title,
      recipient,
      awardee,
      awardDate,
      description,
      image,
      publicId,
      featured:
        featured === true ||
        featured === "true",
    });

   return successResponse(
  res,
  201,
  "Award created successfully.",
  award
);
  } catch (error) {
    return errorResponse(
      res,
      error.message ||
        "Failed to create award."
    );
  }
};

/* ==========================================================
   GET ALL AWARDS
========================================================== */

export const getAwards = async (
  req,
  res
) => {
  try {
    const awards = await Award.find({
      isActive: true,
    })
      .sort({
        awardDate: -1,
      })
      .lean();

    return successResponse(
  res,
  200,
  "Awards fetched successfully.",
  {
    count: awards.length,
    awards,
  }
);
  } catch (error) {
    return errorResponse(
      res,
      error.message ||
        "Failed to fetch awards."
    );
  }
};

/* ==========================================================
   GET SINGLE AWARD
========================================================== */

export const getAwardById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
  res,
  400,
  "Invalid award ID."
);
    }

    const award = await findAward(id).lean();

    if (!award) {
      return errorResponse(
  res,
  404,
  "Award not found."
);
    }

    return successResponse(
  res,
  200,
  "Award fetched successfully.",
  award
);
  } catch (error) {
  return errorResponse(
  res,
  500,
  error.message ||
    "Failed to fetch awards.",
  error
);
  }
};

/* ==========================================================
   Continue in Part 2
========================================================== */
/* ==========================================================
   UPDATE AWARD
========================================================== */

export const updateAward = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        "Invalid award ID.",
        400
      );
    }

    const award = await findAward(id);

    if (!award) {
      return errorResponse(
        res,
        404,
        error.message || "Award not found.",
        error
      );
    }

    const {
      title,
      recipient,
      awardee,
      awardDate,
      description,
      featured,
    } = req.body;

    award.title = title ?? award.title;
    award.recipient = recipient ?? award.recipient;
    award.awardee = awardee ?? award.awardee;
    award.awardDate = awardDate ?? award.awardDate;
    award.description =
      description ?? award.description;

    if (featured !== undefined) {
      award.featured =
        featured === true ||
        featured === "true";
    }

    /* ===============================
       IMAGE UPDATE
    =============================== */

    if (req.file) {
      if (award.publicId) {
        await deleteFromCloudinary(
          award.publicId
        );
      }

      const result =
        await uploadImageToCloudinary(
          req.file,
          "awards"
        );

      award.image =
        result.secure_url;

      award.publicId =
        result.public_id;
    }

    await award.save();

    return successResponse(
  res,
  200,
  "Award updated successfully.",
  award
);
  } catch (error) {
    return errorResponse(
      res,
      error.message ||
        "Failed to update award."
    );
  }
};

/* ==========================================================
   DELETE AWARD
========================================================== */

export const deleteAward = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return errorResponse(
        res,
        400,
        error.message || "Invalid award ID.",
        error
      );
    }

    const award = await findAward(id);

    if (!award) {
      return errorResponse(
        res,
        404,
        error.message || "Award not found.",
        error
      );
    }

    if (award.publicId) {
      await deleteFromCloudinary(
        award.publicId
      );
    }

    await award.deleteOne();

    return successResponse(
  res,
  200,
  "Award deleted successfully."
);
  } catch (error) {
    return errorResponse(
      res,
      error.message ||
        "Failed to delete award."
    );
  }
};

/* ==========================================================
   DELETE ALL AWARDS
========================================================== */

export const deleteAllAwards =
  async (req, res) => {
    try {
      const awards =
        await Award.find().lean();

      await Promise.all(
        awards
          .filter(
            (award) =>
              award.publicId
          )
          .map((award) =>
            deleteFromCloudinary(
              award.publicId
            )
          )
      );

      await Award.deleteMany({});

     return successResponse(
  res,
  200,
  "All awards deleted successfully."
);
    } catch (error) {
      return errorResponse(
        res,
        error.message ||
          "Failed to delete awards."
      );
    }
  };