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
  updateData.whyParticipate = updateData.whyParticipate.map((item) => ({
    title: item.title || "",
    image: typeof item.image === "string" ? item.image : "",
    imagePublicId: item.imagePublicId || "",
  }));

  const whyImageFiles = req.files?.filter(
    (file) => file.fieldname === "whyImages"
  ) || [];

  for (
    let i = 0;
    i < updateData.whyParticipate.length;
    i++
  ) {
    const file = whyImageFiles[i];

    if (!file) continue;

    // delete previous image if replacing
    if (
      sparkQuest?.whyParticipate?.[i]?.imagePublicId
    ) {
      await deleteFromCloudinary(
        sparkQuest.whyParticipate[i].imagePublicId,
        "image"
      );
    }

    const uploaded =
      await uploadImageToCloudinary(
        file,
        "spark-quest/why-participate"
      );

    updateData.whyParticipate[i].image =
      uploaded.secure_url;

    updateData.whyParticipate[i].imagePublicId =
      uploaded.public_id;
  }

  // Preserve existing image if no new file was uploaded
 const existingCards = sparkQuest?.whyParticipate || [];

updateData.whyParticipate = updateData.whyParticipate.map(
  (card, index) => ({
    ...card,
    image:
      card.image ||
      existingCards[index]?.image ||
      "",
    imagePublicId:
      card.imagePublicId ||
      existingCards[index]?.imagePublicId ||
      "",
  })
);
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
  Array.isArray(
    sparkQuest?.whyParticipate
  )
) {
  for (const card of sparkQuest.whyParticipate) {
    if (card.imagePublicId) {
      await deleteFromCloudinary(
        card.imagePublicId,
        "image"
      );
    }
  }
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