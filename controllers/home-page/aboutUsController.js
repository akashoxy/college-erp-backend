import AboutUs from "../../models/home-page/AboutUs.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   HELPERS
========================================================== */

const getAboutUsDocument = () =>
  AboutUs.findOne();

/* ==========================================================
   CREATE ABOUT US
   (Single Document CMS)
========================================================== */

export const createAboutUs = async (
  req,
  res
) => {
  try {
    const existing =
      await getAboutUsDocument();

    if (existing) {
      return errorResponse(
  res,
  400,
  "About Us page already exists."
);
    }

    let campusImage = "";
    let campusImagePublicId = "";

    let principalImage = "";
    let principalImagePublicId = "";

    /* ==========================
       CAMPUS IMAGE
    ========================== */

    if (
      req.files?.campusImage?.[0]
    ) {
      const result =
        await uploadImageToCloudinary(
          req.files.campusImage[0],
          "about-us"
        );

      campusImage =
        result.secure_url;

      campusImagePublicId =
        result.public_id;
    }

    /* ==========================
       PRINCIPAL IMAGE
    ========================== */

    if (
      req.files?.principalImage?.[0]
    ) {
      const result =
        await uploadImageToCloudinary(
          req.files.principalImage[0],
          "about-us"
        );

      principalImage =
        result.secure_url;

      principalImagePublicId =
        result.public_id;
    }

    const about =
      await AboutUs.create({
        ...req.body,

        campusImage,
        campusImagePublicId,

        principalImage,
        principalImagePublicId,
      });

    return successResponse(
  res,
  201,
  "About Us page created successfully.",
  about
);

  } catch (error) {

   return errorResponse(
  res,
  500,
  error.message ||
    "Failed to create About Us page.",
  error
);

  }
};


/* ==========================================================
   GET ABOUT US
========================================================== */

export const getAboutUs = async (
  req,
  res
) => {
  try {
    const about =
      await getAboutUsDocument().lean();

    return successResponse(
  res,
  200,
  "About Us page fetched successfully.",
  about || {}
);

  } catch (error) {

   return errorResponse(
  res,
  500,
  error.message ||
    "Failed to fetch About Us page.",
  error
);

  }
};


/* ==========================================================
   UPDATE ABOUT US
========================================================== */

export const updateAboutUs = async (
  req,
  res
) => {
  try {
    const about =
      await getAboutUsDocument();

    if (!about) {
      return errorResponse(
  res,
  404,
  "About Us page not found."
);
    }

    /* ==========================
       CAMPUS IMAGE
    ========================== */

    if (
      req.files?.campusImage?.[0]
    ) {
      if (
        about.campusImagePublicId
      ) {
        await deleteFromCloudinary(
          about.campusImagePublicId
        );
      }

      const result =
        await uploadImageToCloudinary(
          req.files.campusImage[0],
          "about-us"
        );

      about.campusImage =
        result.secure_url;

      about.campusImagePublicId =
        result.public_id;
    }

    /* ==========================
       PRINCIPAL IMAGE
    ========================== */

    if (
      req.files?.principalImage?.[0]
    ) {
      if (
        about.principalImagePublicId
      ) {
        await deleteFromCloudinary(
          about.principalImagePublicId
        );
      }

      const result =
        await uploadImageToCloudinary(
          req.files.principalImage[0],
          "about-us"
        );

      about.principalImage =
        result.secure_url;

      about.principalImagePublicId =
        result.public_id;
    }

    /* ==========================
       UPDATE TEXT FIELDS
    ========================== */

    Object.entries(req.body).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ""
        ) {
          about[key] = value;
        }
      }
    );

    await about.save();

    return successResponse(
  res,
  200,
  "About Us page updated successfully.",
  about
);

  } catch (error) {

    return errorResponse(
  res,
  500,
  error.message ||
    "Failed to update About Us page.",
  error
);

  }
};


/* ==========================================================
   DELETE ABOUT US
========================================================== */

export const deleteAboutUs = async (
  req,
  res
) => {
  try {
    const about =
      await getAboutUsDocument();

    if (!about) {
      return errorResponse(
  res,
  404,
  "About Us page not found."
);
    }

    /* ==========================
       DELETE CLOUDINARY IMAGES
    ========================== */

    await Promise.all([
      about.campusImagePublicId
        ? deleteFromCloudinary(
            about.campusImagePublicId
          )
        : Promise.resolve(),

      about.principalImagePublicId
        ? deleteFromCloudinary(
            about.principalImagePublicId
          )
        : Promise.resolve(),
    ]);

    /* ==========================
       DELETE DOCUMENT
    ========================== */

    await about.deleteOne();

   return successResponse(
  res,
  200,
  "About Us page deleted successfully."
);

  } catch (error) {

   return errorResponse(
  res,
  500,
  error.message ||
    "Failed to delete About Us page.",
  error
);

  }
};
