import AnnualSportsMeet from "../../models/life-at-tih/AnnualSportsMeet.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

// ==========================================================
// HELPERS
// ==========================================================

const parseArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const getSportsDocument = async () => {
  let sports = await AnnualSportsMeet.findOne();

  if (!sports) {
    sports = await AnnualSportsMeet.create({});
  }

  return sports;
};

const uploadImage = async (
  file,
  folder
) => {
  if (!file) return null;

  return await uploadImageToCloudinary(
    file.buffer,
    folder
  );
};

const removeImage = async (
  publicId
) => {
  if (!publicId) return;

  await deleteFromCloudinary(publicId);
};

// ==========================================================
// GET ANNUAL SPORTS MEET
// ==========================================================

export const getAnnualSportsMeet =
  async (req, res) => {
    try {
      const sports =
        await getSportsDocument();

      return successResponse(
        res,
        200,
        "Annual Sports Meet fetched successfully.",
        sports
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to fetch Annual Sports Meet.",
        error
      );
    }
  };

// ==========================================================
// CREATE / UPDATE ANNUAL SPORTS MEET
// ==========================================================

export const createOrUpdateAnnualSportsMeet =
  async (req, res) => {
    try {
      let sports =
        await AnnualSportsMeet.findOne();

     const payload = {
  ...req.body,

  stats: parseArray(req.body.stats),

  highlights: parseArray(req.body.highlights),

  sportsEvents: parseArray(req.body.sportsEvents),

  achievements: parseArray(req.body.achievements),

  gallery: parseArray(req.body.gallery),

  timeline: parseArray(req.body.timeline),
};

      if (req.file) {
        await removeImage(
          sports?.heroImagePublicId
        );

        const uploaded =
          await uploadImage(
            req.file,
            "annual-sports"
          );

        if (uploaded) {
          payload.heroImage =
            uploaded.secure_url;

          payload.heroImagePublicId =
            uploaded.public_id;
        }
      }

      if (!sports) {
        sports =
          await AnnualSportsMeet.create(
            payload
          );
      } else {
        sports =
          await AnnualSportsMeet.findByIdAndUpdate(
            sports._id,
            payload,
            {
              new: true,
              runValidators: true,
            }
          );
      }

      return successResponse(
        res,
        200,
        "Annual Sports Meet saved successfully.",
        sports
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to save Annual Sports Meet.",
        error
      );
    }
  };
  // ==========================================================
// DELETE ANNUAL SPORTS MEET
// ==========================================================

export const deleteAnnualSportsMeet =
  async (req, res) => {
    try {
      const sports =
        await AnnualSportsMeet.findOne();

      if (!sports) {
        return successResponse(
          res,
          200,
          "Annual Sports Meet already empty."
        );
      }

      // Clean up every image stored on Cloudinary before wiping the doc.
      await removeImage(sports.heroImagePublicId);

      await Promise.all(
        sports.sportsEvents.map((event) =>
          removeImage(event.imagePublicId)
        )
      );

      await Promise.all(
  sports.gallery.map((item) =>
    removeImage(item.imagePublicId)
  )
);

      await Promise.all(
        sports.achievements.map((achievement) =>
          removeImage(achievement.imagePublicId)
        )
      );

      await AnnualSportsMeet.deleteOne({
        _id: sports._id,
      });

      return successResponse(
        res,
        200,
        "Annual Sports Meet deleted successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to delete Annual Sports Meet.",
        error
      );
    }
  };

// ==========================================================
// ADD SPORTS EVENT
// ==========================================================

export const addSportsEvent =
  async (req, res) => {
    try {
      const sports =
        await getSportsDocument();

      const uploaded =
        req.file
          ? await uploadImage(
              req.file,
              "annual-sports/events"
            )
          : null;

      sports.sportsEvents.push({
        title:
          req.body.title?.trim() || "",

        description:
          req.body.description?.trim() ||
          "",

        image:
          uploaded?.secure_url || "",

        imagePublicId:
          uploaded?.public_id || "",
      });

      await sports.save();

      return successResponse(
        res,
        201,
        "Sports event added successfully.",
        sports
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to add sports event.",
        error
      );
    }
  };

// ==========================================================
// UPDATE SPORTS EVENT
// ==========================================================

export const updateSportsEvent =
  async (req, res) => {
    try {
      const sports =
        await getSportsDocument();

      const event =
        sports.sportsEvents.id(
          req.params.id
        );

      if (!event) {
        return errorResponse(
          res,
          404,
          "Sports event not found."
        );
      }

      if (req.body.title !== undefined) {
        event.title =
          req.body.title.trim();
      }

      if (
        req.body.description !==
        undefined
      ) {
        event.description =
          req.body.description.trim();
      }

      if (req.file) {
        await removeImage(
          event.imagePublicId
        );

        const uploaded =
          await uploadImage(
            req.file,
            "annual-sports/events"
          );

        if (uploaded) {
          event.image =
            uploaded.secure_url;

          event.imagePublicId =
            uploaded.public_id;
        }
      }

      await sports.save();

      return successResponse(
        res,
        200,
        "Sports event updated successfully.",
        sports
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to update sports event.",
        error
      );
    }
  };

// ==========================================================
// DELETE SPORTS EVENT
// ==========================================================

export const deleteSportsEvent =
  async (req, res) => {
    try {
      const sports =
        await getSportsDocument();

      const event =
        sports.sportsEvents.id(
          req.params.id
        );

      if (!event) {
        return errorResponse(
          res,
          404,
          "Sports event not found."
        );
      }

      await removeImage(
        event.imagePublicId
      );

      event.deleteOne();

      await sports.save();

      return successResponse(
        res,
        200,
        "Sports event deleted successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to delete sports event.",
        error
      );
    }
  };

// ==========================================================
// ADD ACHIEVEMENT
// ==========================================================

export const addAchievement = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    const uploaded = req.file
      ? await uploadImage(req.file, "annual-sports/achievements")
      : null;

    sports.achievements.push({
      title: req.body.title?.trim() || "",
      description: req.body.description?.trim() || "",
      image: uploaded?.secure_url || "",
      imagePublicId: uploaded?.public_id || "",
    });

    await sports.save();

    return successResponse(
      res,
      201,
      "Achievement added successfully.",
      sports
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to add achievement.",
      error
    );
  }
};

// ==========================================================
// UPDATE ACHIEVEMENT
// ==========================================================

export const updateAchievement = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    const achievement = sports.achievements.id(req.params.id);

    if (!achievement) {
      return errorResponse(
        res,
        404,
        "Achievement not found."
      );
    }

    if (req.body.title !== undefined)
      achievement.title = req.body.title.trim();

    if (req.body.description !== undefined)
      achievement.description = req.body.description.trim();

    if (req.file) {
      await removeImage(achievement.imagePublicId);

      const uploaded = await uploadImage(
        req.file,
        "annual-sports/achievements"
      );

      if (uploaded) {
        achievement.image = uploaded.secure_url;
        achievement.imagePublicId = uploaded.public_id;
      }
    }

    await sports.save();

    return successResponse(
      res,
      200,
      "Achievement updated successfully.",
      sports
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to update achievement.",
      error
    );
  }
};

// ==========================================================
// DELETE ACHIEVEMENT
// ==========================================================

export const deleteAchievement = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    const achievement = sports.achievements.id(req.params.id);

    if (!achievement) {
      return errorResponse(
        res,
        404,
        "Achievement not found."
      );
    }

    await removeImage(achievement.imagePublicId);

    achievement.deleteOne();

    await sports.save();

    return successResponse(
      res,
      200,
      "Achievement deleted successfully."
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to delete achievement.",
      error
    );
  }
};