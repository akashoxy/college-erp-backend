import CommonRoom from "../../models/facilities/CommonRoom.js";

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
      process.env.NODE_ENV ===
      "development"
        ? error
        : undefined,

  });

};

/* ==========================================================
   HELPER FUNCTIONS
========================================================== */

const getFileByField = (
  files,
  fieldName
) => {

  return (

    files || []

  ).find(

    (file) =>

      file.fieldname ===
      fieldName

  );

};

const useImageUrl = (
  url
) => {

  return (

    typeof url ===
      "string"

    &&

    url.startsWith(
      "http"
    )

  );

};

const removeImage =
  async (
    publicId
  ) => {

    if (!publicId)
      return;

    try {

      await deleteFromCloudinary(

        publicId,

        "image"

      );

    }

    catch {}

  };

/* ==========================================================
   IMAGE HELPER
========================================================== */

const uploadImage =
  async (
    file,
    folder
  ) => {

    if (!file) {

      return {

        secure_url: "",

        public_id: "",

      };

    }

    return await uploadImageToCloudinary(

      file,

      folder

    );

  };

/* ==========================================================
   PART 2 STARTS HERE

   getCommonRoom()

   createOrUpdateCommonRoom()

========================================================== */
/* ==========================================================
   GET COMMON ROOM
========================================================== */

export const getCommonRoom =
  async (req, res) => {

    try {

      let commonRoom =
        await CommonRoom.findOne().lean();

      if (!commonRoom) {

        const created =
          await CommonRoom.create({

            heroSubtitle:
              "Relax • Refresh • Reconnect",

            heroImage: "",

            heroImagePublicId: "",

            aboutText: "",

            games: [],

          });

        commonRoom =
          created.toObject();

      }

      return successResponse(

        res,

        200,

        "Common Room fetched successfully.",

        commonRoom

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to fetch Common Room.",

        error.message

      );

    }

  };

/* ==========================================================
   CREATE / UPDATE COMMON ROOM
   (Single Document CMS)
========================================================== */

export const createOrUpdateCommonRoom =
  async (req, res) => {

    try {

      let commonRoom =
        await CommonRoom.findOne();

      const heroFile =
        getFileByField(

          req.files,

          "heroImage"

        );

      let heroImage =
        commonRoom?.heroImage || "";

      let heroImagePublicId =
        commonRoom?.heroImagePublicId || "";

      /* ======================================
         HERO IMAGE URL
      ====================================== */

      if (
        useImageUrl(
          req.body.heroImage
        )
      ) {

        if (
          commonRoom?.heroImagePublicId
        ) {

          await removeImage(

            commonRoom.heroImagePublicId

          );

        }

        heroImage =
          req.body.heroImage;

        heroImagePublicId =
          "";

      }

      /* ======================================
         CLOUDINARY IMAGE
      ====================================== */

      else if (
        heroFile
      ) {

        if (
          commonRoom?.heroImagePublicId
        ) {

          await removeImage(

            commonRoom.heroImagePublicId

          );

        }

        const upload =
          await uploadImage(

            heroFile,

            "common-room"

          );

        heroImage =
          upload.secure_url;

        heroImagePublicId =
          upload.public_id;

      }

      /* ======================================
         PAYLOAD
      ====================================== */

      const payload = {

        heroSubtitle:

          req.body.heroSubtitle?.trim()

          ||

          commonRoom?.heroSubtitle

          ||

          "Relax • Refresh • Reconnect",

        heroImage,

        heroImagePublicId,

        aboutText:

          req.body.aboutText?.trim()

          ||

          commonRoom?.aboutText

          ||

          "",

      };

      /* ======================================
         UPDATE
      ====================================== */

      if (
        commonRoom
      ) {

        const updated =
          await CommonRoom.findByIdAndUpdate(

            commonRoom._id,

            {
              $set: payload,
            },

            {
              new: true,
              runValidators: true,
            }

          );

        return successResponse(

          res,

          200,

          "Common Room updated successfully.",

          updated

        );

      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await CommonRoom.create({

          ...payload,

          games: [],

        });

      return successResponse(

        res,

        201,

        "Common Room created successfully.",

        created

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to save Common Room.",

        error.message

      );

    }

  };

/* ==========================================================
   PART 3 STARTS HERE

   addGame()

========================================================== */
/* ==========================================================
   ADD GAME
========================================================== */

export const addGame =
  async (req, res) => {

    try {

      const commonRoom =
        await CommonRoom.findOne();

      if (!commonRoom) {

        return errorResponse(

          res,

          404,

          "Common Room data not found."

        );

      }

      /* ======================================
         VALIDATION
      ====================================== */

      if (
        !req.body.title?.trim()
      ) {

        return errorResponse(

          res,

          400,

          "Game title is required."

        );

      }

      /* ======================================
         IMAGE
      ====================================== */

      const imageFile =
        getFileByField(

          req.files,

          "image"

        );

      let image = "";

      let imagePublicId = "";

      /* ===============================
         IMAGE URL
      =============================== */

      if (
        useImageUrl(
          req.body.image
        )
      ) {

        image =
          req.body.image;

      }

      /* ===============================
         CLOUDINARY IMAGE
      =============================== */

      else if (
        imageFile
      ) {

        const upload =
          await uploadImage(

            imageFile,

            "common-room/games"

          );

        image =
          upload.secure_url;

        imagePublicId =
          upload.public_id;

      }

      /* ======================================
         CREATE GAME
      ====================================== */

      commonRoom.games.push({

        title:

          req.body.title.trim(),

        description:

          req.body.description?.trim()

          ||

          "",

        image,

        imagePublicId,

        featured:

          req.body.featured ===
            true ||

          req.body.featured ===
            "true",

      });

      await commonRoom.save();

      return successResponse(

        res,

        201,

        "Game added successfully.",

        commonRoom

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to add game.",

        error.message

      );

    }

  };

/* ==========================================================
   PART 4 STARTS HERE

   updateGame()

========================================================== */
/* ==========================================================
   UPDATE GAME
========================================================== */

export const updateGame =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const commonRoom =
        await CommonRoom.findOne();

      if (!commonRoom) {

        return errorResponse(

          res,

          404,

          "Common Room data not found."

        );

      }

      const game =
        commonRoom.games.id(id);

      if (!game) {

        return errorResponse(

          res,

          404,

          "Game not found."

        );

      }

      /* ======================================
         BASIC FIELDS
      ====================================== */

      game.title =

        req.body.title?.trim()

        ??

        game.title;

      game.description =

        req.body.description?.trim()

        ??

        game.description;

      if (
        req.body.featured !==
        undefined
      ) {

        game.featured =

          req.body.featured ===
            true ||

          req.body.featured ===
            "true";

      }

      /* ======================================
         IMAGE
      ====================================== */

      const imageFile =
        getFileByField(

          req.files,

          "image"

        );

      /* ===============================
         IMAGE URL SUPPORT
      =============================== */

      if (
        useImageUrl(
          req.body.image
        )
      ) {

        if (
          game.imagePublicId
        ) {

          await removeImage(

            game.imagePublicId

          );

        }

        game.image =
          req.body.image;

        game.imagePublicId =
          "";

      }

      /* ===============================
         CLOUDINARY IMAGE
      =============================== */

      else if (
        imageFile
      ) {

        if (
          game.imagePublicId
        ) {

          await removeImage(

            game.imagePublicId

          );

        }

        const upload =
          await uploadImage(

            imageFile,

            "common-room/games"

          );

        game.image =
          upload.secure_url;

        game.imagePublicId =
          upload.public_id;

      }

      /* ======================================
         SAVE
      ====================================== */

      await commonRoom.save();

      return successResponse(

        res,

        200,

        "Game updated successfully.",

        commonRoom

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to update game.",

        error.message

      );

    }

  };

/* ==========================================================
   PART 5 STARTS HERE

   deleteGame()

   deleteHeroImage()

========================================================== */
/* ==========================================================
   DELETE GAME
========================================================== */

export const deleteGame =
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const commonRoom =
        await CommonRoom.findOne();

      if (!commonRoom) {

        return errorResponse(

          res,

          404,

          "Common Room data not found."

        );

      }

      const game =
        commonRoom.games.id(id);

      if (!game) {

        return errorResponse(

          res,

          404,

          "Game not found."

        );

      }

      /* ======================================
         DELETE GAME IMAGE
      ====================================== */

      if (
        game.imagePublicId
      ) {

        await removeImage(
          game.imagePublicId
        );

      }

      /* ======================================
         REMOVE GAME
      ====================================== */

      game.deleteOne();

      await commonRoom.save();

      return successResponse(

        res,

        200,

        "Game deleted successfully.",

        commonRoom

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete game.",

        error.message

      );

    }

  };

/* ==========================================================
   DELETE HERO IMAGE
========================================================== */

export const deleteHeroImage =
  async (req, res) => {

    try {

      const commonRoom =
        await CommonRoom.findOne();

      if (!commonRoom) {

        return errorResponse(

          res,

          404,

          "Common Room data not found."

        );

      }

      /* ======================================
         DELETE HERO IMAGE
      ====================================== */

      if (
        commonRoom.heroImagePublicId
      ) {

        await removeImage(
          commonRoom.heroImagePublicId
        );

      }

      /* ======================================
         CLEAR HERO IMAGE
      ====================================== */

      commonRoom.heroImage = "";

      commonRoom.heroImagePublicId = "";

      await commonRoom.save();

      return successResponse(

        res,

        200,

        "Hero image deleted successfully.",

        commonRoom

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete hero image.",

        error.message

      );

    }

  };

  export const deleteCommonRoom = async (req, res) => {
    const commonRoom = await CommonRoom.findOne();

    if (!commonRoom) {
        return errorResponse(res,404,"Common Room not found.");
    }

    if (commonRoom.heroImagePublicId) {
        await deleteFromCloudinary(commonRoom.heroImagePublicId,"image");
    }

    for (const game of commonRoom.games) {
        if (game.imagePublicId) {
            await deleteFromCloudinary(game.imagePublicId,"image");
        }
    }

    await CommonRoom.findByIdAndDelete(commonRoom._id);

    return successResponse(
        res,
        200,
        "Common Room deleted successfully."
    );
};