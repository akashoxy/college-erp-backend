import RadioTih from "../../models/facilities/RadioTih.js";

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
      process.env.NODE_ENV === "development"
        ? error
        : undefined,
  });
};

/* ==========================================================
   GET RADIO TIH
========================================================== */

export const getRadioTih = async (
  req,
  res
) => {
  try {
    const data =
      await RadioTih.findOne().lean();

    return successResponse(
      res,
      200,
      "Radio TIH fetched successfully.",
      data
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch Radio TIH.",
      error.message
    );
  }
};

/* ==========================================================
   CREATE / UPDATE
   (Single Document CMS)
========================================================== */

export const createOrUpdateRadioTih =
  async (req, res) => {
    try {
      const existing =
        await RadioTih.findOne();

      const updateData = {};

      /* ======================================
         BANNER VIDEO
      ====================================== */

      if (
        req.body.bannerVideo !==
        undefined
      ) {
        updateData.bannerVideo =
          req.body.bannerVideo.trim();
      } else {
        updateData.bannerVideo =
          existing?.bannerVideo || "";
      }

      /* ======================================
         PROGRAM LIST
      ====================================== */

      if (
        req.body.programList !==
        undefined
      ) {
        let programList =
          req.body.programList;

        if (
          typeof programList ===
          "string"
        ) {
          try {
            programList =
              JSON.parse(programList);
          } catch {
            programList = [];
          }
        }

        updateData.programList =
          Array.isArray(programList)
            ? programList
            : [];
      } else {
        updateData.programList =
          existing?.programList || [];
      }

      /* ======================================
         UPDATE
      ====================================== */

      if (existing) {
        const updated =
          await RadioTih.findByIdAndUpdate(
            existing._id,
            {
              $set: updateData,
            },
           {
              returnDocument: "after",
              runValidators: true,
            }
          );

        return successResponse(
          res,
          200,
          "Radio TIH updated successfully.",
          updated
        );
      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await RadioTih.create(
          updateData
        );

      return successResponse(
        res,
        201,
        "Radio TIH created successfully.",
        created
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to save Radio TIH.",
        error.message
      );
    }
  };

/* ==========================================================
   DELETE RADIO TIH
========================================================== */

export const deleteRadioTih =
  async (req, res) => {
    try {
      const existing =
        await RadioTih.findOne();

      if (!existing) {
        return errorResponse(
          res,
          404,
          "Radio TIH data not found."
        );
      }

      await RadioTih.deleteMany();

      return successResponse(
        res,
        200,
        "Radio TIH deleted successfully."
      );
    } catch (error) {
      return errorResponse(
        res,
        500,
        "Failed to delete Radio TIH.",
        error.message
      );
    }
  };