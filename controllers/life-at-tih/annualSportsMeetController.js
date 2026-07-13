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

const uploadImage = async (file, folder) => {
  if (!file) return null;

  return await uploadImageToCloudinary(file.buffer, folder);
};

// Cloudinary cleanup is ALWAYS best-effort. A single stale/invalid
// public_id, a transient Cloudinary API error, or missing Cloudinary
// credentials must never be able to block a real database operation
// (like deleting the record). Every failure here is caught and logged,
// never re-thrown.
const removeImage = async (publicId, label = "image") => {
  if (!publicId) return;

  try {
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error(
      `[AnnualSportsMeet] Failed to delete Cloudinary ${label} (${publicId}):`,
      error
    );
  }
};

// Runs a batch of image-removal promises, isolated so that even an
// unexpected synchronous throw (bad data shape, etc.) inside the loop
// can't propagate and abort the caller.
const removeImagesSafely = async (items = [], label) => {
  if (!Array.isArray(items) || items.length === 0) return;

  const results = await Promise.allSettled(
    items.map((item) => removeImage(item?.imagePublicId, label))
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        `[AnnualSportsMeet] Unexpected failure cleaning up ${label}:`,
        result.reason
      );
    }
  });
};

// Builds the mongoose update payload from req.body, but ONLY includes
// keys that were actually present in the request. This matters a lot
// for the array fields (highlights, sportsEvents, achievements,
// timeline): the frontend has several independent forms (basic info,
// events, achievements) that each submit only a subset of these
// fields. If we always forced every array key onto the payload,
// `parseArray(undefined)` would resolve to `[]` and a save from one
// form (e.g. saving the hero image) would silently wipe out data
// managed by a different form (e.g. sports events / achievements)
// that it never sent and was never meant to touch.
const buildUpdatePayload = (body) => {
  const payload = { ...body };

  const arrayFields = [
    "highlights",
    "sportsEvents",
    "achievements",
    "timeline",
  ];

  arrayFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = parseArray(body[field]);
    } else {
      delete payload[field];
    }
  });

  return payload;
};

// ==========================================================
// GET ANNUAL SPORTS MEET
// ==========================================================

export const getAnnualSportsMeet = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    return successResponse(
      res,
      200,
      "Annual Sports Meet fetched successfully.",
      sports
    );
  } catch (error) {
    console.error("[AnnualSportsMeet] getAnnualSportsMeet failed:", error);

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

export const createOrUpdateAnnualSportsMeet = async (req, res) => {
  try {
    let sports = await AnnualSportsMeet.findOne();

    // Only fields actually present in req.body end up in the payload.
    // See buildUpdatePayload() for why this matters — it stops a
    // basic-info-only save (e.g. just the hero image) from wiping out
    // sportsEvents/achievements that this request never sent.
    const payload = buildUpdatePayload(req.body);

    if (!sports) {
      sports = await AnnualSportsMeet.create(payload);
    } else {
      // IMPORTANT: must be wrapped in `$set`. A plain object with no
      // atomic operator is treated by MongoDB as a full REPLACEMENT
      // of the document (everything except _id), not a partial merge.
      // Since `payload` intentionally omits keys the current form
      // never sent (see buildUpdatePayload above — e.g. a hero-image-only
      // save omits sportsEvents/achievements), a plain-object update
      // would silently delete those omitted fields instead of leaving
      // them alone. `$set` only touches the keys actually present.
      sports = await AnnualSportsMeet.findByIdAndUpdate(
        sports._id,
        { $set: payload },
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
    console.error(
      "[AnnualSportsMeet] createOrUpdateAnnualSportsMeet failed:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to save Annual Sports Meet.",
      error
    );
  }
};

// ==========================================================
// UPDATE HERO IMAGE (dedicated, atomic — image only)
// ==========================================================
//
// Kept completely separate from createOrUpdateAnnualSportsMeet on
// purpose. That endpoint saves whatever the "basic info" form has in
// state at the time, which is a much bigger surface area and can go
// stale relative to sportsEvents/achievements if those were changed
// in another tab/flow moments earlier. This endpoint's $set payload
// contains ONLY heroImage + heroImagePublicId, so it is structurally
// impossible for a hero image change to affect any other field,
// regardless of timing or what the rest of the form currently holds.

export const updateHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No image file was provided.");
    }

    const sports = await getSportsDocument();

    const uploaded = await uploadImage(req.file, "annual-sports");

    if (!uploaded) {
      return errorResponse(res, 500, "Failed to upload hero image.");
    }

    // Delete the old Cloudinary image only after the new one has
    // uploaded successfully, and only best-effort (see removeImage).
    const previousPublicId = sports.heroImagePublicId;

    const updated = await AnnualSportsMeet.findByIdAndUpdate(
      sports._id,
      {
        $set: {
          heroImage: uploaded.secure_url,
          heroImagePublicId: uploaded.public_id,
        },
      },
      { new: true, runValidators: true }
    );

    await removeImage(previousPublicId, "hero image");

    return successResponse(
      res,
      200,
      "Hero image updated successfully.",
      updated
    );
  } catch (error) {
    console.error("[AnnualSportsMeet] updateHeroImage failed:", error);

    return errorResponse(res, 500, "Failed to update hero image.", error);
  }
};

// ==========================================================
// DELETE ANNUAL SPORTS MEET
// ==========================================================

export const deleteAnnualSportsMeet = async (req, res) => {
  try {
    const sports = await AnnualSportsMeet.findOne();

    if (!sports) {
      return successResponse(
        res,
        200,
        "Annual Sports Meet already empty."
      );
    }

    // Step 1: delete the database record FIRST. This is the operation
    // the user actually cares about, and it must succeed independently
    // of whatever happens to the associated Cloudinary images.
    await AnnualSportsMeet.deleteOne({ _id: sports._id });

    // Step 2: clean up images best-effort, AFTER the record is gone.
    // Any failure here is only logged — it can no longer affect the
    // response the user gets, since the delete has already succeeded.
    removeImage(sports.heroImagePublicId, "hero image").catch((error) =>
      console.error(
        "[AnnualSportsMeet] Unexpected hero image cleanup failure:",
        error
      )
    );

    removeImagesSafely(sports.sportsEvents, "sports event image");
    removeImagesSafely(sports.achievements, "achievement image");

    return successResponse(
      res,
      200,
      "Annual Sports Meet deleted successfully."
    );
  } catch (error) {
    console.error(
      "[AnnualSportsMeet] deleteAnnualSportsMeet failed:",
      error
    );

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

export const addSportsEvent = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    const uploaded = req.file
      ? await uploadImage(req.file, "annual-sports/events")
      : null;

    sports.sportsEvents.push({
      title: req.body.title?.trim() || "",
      description: req.body.description?.trim() || "",
      image: uploaded?.secure_url || "",
      imagePublicId: uploaded?.public_id || "",
    });

    await sports.save();

    return successResponse(
      res,
      201,
      "Sports event added successfully.",
      sports
    );
  } catch (error) {
    console.error("[AnnualSportsMeet] addSportsEvent failed:", error);

    return errorResponse(res, 500, "Failed to add sports event.", error);
  }
};

// ==========================================================
// UPDATE SPORTS EVENT
// ==========================================================

export const updateSportsEvent = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    const event = sports.sportsEvents.id(req.params.id);

    if (!event) {
      return errorResponse(res, 404, "Sports event not found.");
    }

    if (req.body.title !== undefined) {
      event.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      event.description = req.body.description.trim();
    }

    if (req.file) {
      await removeImage(event.imagePublicId, "sports event image");

      const uploaded = await uploadImage(
        req.file,
        "annual-sports/events"
      );

      if (uploaded) {
        event.image = uploaded.secure_url;
        event.imagePublicId = uploaded.public_id;
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
    console.error("[AnnualSportsMeet] updateSportsEvent failed:", error);

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

export const deleteSportsEvent = async (req, res) => {
  try {
    const sports = await getSportsDocument();

    const event = sports.sportsEvents.id(req.params.id);

    if (!event) {
      return errorResponse(res, 404, "Sports event not found.");
    }

    const imagePublicId = event.imagePublicId;

    event.deleteOne();

    await sports.save();

    // Cleanup happens after the record change is saved, and can never
    // block or fail the response.
    removeImage(imagePublicId, "sports event image").catch(() => {});

    return successResponse(
      res,
      200,
      "Sports event deleted successfully."
    );
  } catch (error) {
    console.error("[AnnualSportsMeet] deleteSportsEvent failed:", error);

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
    console.error("[AnnualSportsMeet] addAchievement failed:", error);

    return errorResponse(res, 500, "Failed to add achievement.", error);
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
      return errorResponse(res, 404, "Achievement not found.");
    }

    if (req.body.title !== undefined) {
      achievement.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      achievement.description = req.body.description.trim();
    }

    if (req.file) {
      await removeImage(achievement.imagePublicId, "achievement image");

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
    console.error("[AnnualSportsMeet] updateAchievement failed:", error);

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
      return errorResponse(res, 404, "Achievement not found.");
    }

    const imagePublicId = achievement.imagePublicId;

    achievement.deleteOne();

    await sports.save();

    removeImage(imagePublicId, "achievement image").catch(() => {});

    return successResponse(
      res,
      200,
      "Achievement deleted successfully."
    );
  } catch (error) {
    console.error("[AnnualSportsMeet] deleteAchievement failed:", error);

    return errorResponse(
      res,
      500,
      "Failed to delete achievement.",
      error
    );
  }
};