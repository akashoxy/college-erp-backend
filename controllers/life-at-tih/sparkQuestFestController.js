import SparkQuestFest from "../../models/life-at-tih/SparkQuestFest.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   GET SPARK QUEST FEST
========================================================== */

export const getSparkQuestFest =
  async (
    req,
    res
  ) => {
    try {

      const data =
        await SparkQuestFest.findOne().lean();

      return successResponse(
        res,
        "Spark Quest Fest fetched successfully.",
        data
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to fetch Spark Quest Fest."
      );

    }
  };

/* ==========================================================
   CREATE OR UPDATE
========================================================== */

export const createOrUpdateSparkQuestFest =
  async (
    req,
    res
  ) => {
    try {

      let sparkQuest =
        await SparkQuestFest.findOne();

 if (req.body.whyParticipate) {
  req.body.whyParticipate =
    typeof req.body.whyParticipate === "string"
      ? JSON.parse(req.body.whyParticipate)
      : req.body.whyParticipate;
}

const updateData = {
  ...req.body,
};

/* ==========================================
   CLEAN WHY PARTICIPATE DATA
========================================== */

if (Array.isArray(updateData.whyParticipate)) {

  updateData.whyParticipate =
    updateData.whyParticipate.map((item) => ({

      title: item.title || "",

      image:
        typeof item.image === "string"
          ? item.image
          : "",

      imagePublicId:
        item.imagePublicId || "",

    }));

}

      /* ==========================================
         HERO IMAGE
      ========================================== */

      const heroImageFile =
        req.files?.find(
          (file) =>
            file.fieldname ===
            "heroImage"
        );

      if (heroImageFile) {

        if (
          sparkQuest?.heroImagePublicId
        ) {

          await deleteFromCloudinary(
            sparkQuest.heroImagePublicId,
            "image"
          );

        }

        const uploaded =
          await uploadImageToCloudinary(
            heroImageFile,
            "spark-quest"
          );

        updateData.heroImage =
          uploaded.secure_url;

        updateData.heroImagePublicId =
          uploaded.public_id;

      }

      if (!sparkQuest) {

        sparkQuest =
          await SparkQuestFest.create(
            updateData
          );

        return successResponse(
          res,
          "Spark Quest Fest created successfully.",
          sparkQuest,
          201
        );

      }

      Object.assign(
        sparkQuest,
        updateData
      );

      await sparkQuest.save();

      return successResponse(
        res,
        "Spark Quest Fest updated successfully.",
        sparkQuest
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to save Spark Quest Fest."
      );

    }
  };

/* ==========================================================
   DELETE
========================================================== */

export const deleteSparkQuestFest =
  async (
    req,
    res
  ) => {
    try {

      const sparkQuest =
        await SparkQuestFest.findOne();

      if (!sparkQuest) {

        return errorResponse(
          res,
          "Spark Quest Fest not found.",
          404
        );

      }

      if (
        sparkQuest.heroImagePublicId
      ) {

        await deleteFromCloudinary(
          sparkQuest.heroImagePublicId,
          "image"
        );

      }

      await SparkQuestFest.deleteMany(
        {}
      );

      return successResponse(
        res,
        "Spark Quest Fest deleted successfully."
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete Spark Quest Fest."
      );

    }
  };