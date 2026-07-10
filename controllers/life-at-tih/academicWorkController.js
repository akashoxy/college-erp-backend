import AcademicWork from "../../models/life-at-tih/AcademicWork.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   GET ALL ACADEMIC WORKS
========================================================== */

export const getAcademicWorks =
  async (
    req,
    res
  ) => {
    try {

      const works =
        await AcademicWork.find()
          .sort({
            activityDate: -1,
          })
          .lean();

      return successResponse(
        res,
        "Academic works fetched successfully.",
        works
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to fetch academic works."
      );

    }
  };

/* ==========================================================
   GET ACADEMIC WORK BY ID
========================================================== */

export const getAcademicWork =
  async (
    req,
    res
  ) => {
    try {

      const work =
        await AcademicWork.findById(
          req.params.id
        ).lean();

      if (!work) {

        return errorResponse(
          res,
          "Academic activity not found.",
          404
        );

      }

      return successResponse(
        res,
        "Academic work fetched successfully.",
        work
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to fetch academic work."
      );

    }
  };

/* ==========================================================
   Continue in Part 2
========================================================== */
/* ==========================================================
   CREATE ACADEMIC WORK
========================================================== */

export const createAcademicWork =
  async (
    req,
    res
  ) => {
    try {

      let image = "";
      let imagePublicId = "";

      /* ==========================================
         MAIN IMAGE
      ========================================== */

      if (
        req.files?.image?.[0]
      ) {

        const uploaded =
          await uploadImageToCloudinary(
            req.files.image[0],
            "academic-work"
          );

        image =
          uploaded.secure_url;

        imagePublicId =
          uploaded.public_id;

      }

      /* ==========================================
         GALLERY
      ========================================== */

      const gallery = [];

      if (
        req.files?.gallery
          ?.length
      ) {

        for (const file of req.files.gallery) {

          const uploaded =
            await uploadImageToCloudinary(
              file,
              "academic-work/gallery"
            );

          gallery.push({

            image:
              uploaded.secure_url,

            publicId:
              uploaded.public_id,

            caption: "",

          });

        }

      }

      /* ==========================================
         CREATE DOCUMENT
      ========================================== */

      const academicWork =
        await AcademicWork.create({

          ...req.body,

          image,

          imagePublicId,

          gallery,

        });

      return successResponse(
        res,
        "Academic work created successfully.",
        academicWork,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to create academic work."
      );

    }
  };

/* ==========================================================
   Continue in Part 3
========================================================== */
/* ==========================================================
   UPDATE ACADEMIC WORK
========================================================== */

export const updateAcademicWork =
  async (
    req,
    res
  ) => {
    try {

      const work =
        await AcademicWork.findById(
          req.params.id
        );

      if (!work) {

        return errorResponse(
          res,
          "Academic activity not found.",
          404
        );

      }

      let image =
        work.image;

      let imagePublicId =
        work.imagePublicId;

      /* ==========================================
         UPDATE MAIN IMAGE
      ========================================== */

      if (
        req.files?.image?.[0]
      ) {

        if (
          work.imagePublicId
        ) {

          await deleteFromCloudinary(
            work.imagePublicId,
            "image"
          );

        }

        const uploaded =
          await uploadImageToCloudinary(
            req.files.image[0],
            "academic-work"
          );

        image =
          uploaded.secure_url;

        imagePublicId =
          uploaded.public_id;

      }

      /* ==========================================
         UPDATE GALLERY
      ========================================== */

      let gallery =
        work.gallery || [];

      if (
        req.files?.gallery
          ?.length > 0
      ) {

        if (
          work.gallery?.length
        ) {

          for (const item of work.gallery) {

            if (
              item.publicId
            ) {

              await deleteFromCloudinary(
                item.publicId,
                "image"
              );

            }

          }

        }

        gallery = [];

        for (const file of req.files.gallery) {

          const uploaded =
            await uploadImageToCloudinary(
              file,
              "academic-work/gallery"
            );

          gallery.push({

            image:
              uploaded.secure_url,

            publicId:
              uploaded.public_id,

            caption: "",

          });

        }

      }

      /* ==========================================
         UPDATE DOCUMENT
      ========================================== */

      const updatedWork =
        await AcademicWork.findByIdAndUpdate(
          req.params.id,
          {

            ...req.body,

            image,

            imagePublicId,

            gallery,

          },
          {

            new: true,

            runValidators: true,

          }
        );

      return successResponse(
        res,
        "Academic work updated successfully.",
        updatedWork
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to update academic work."
      );

    }
  };

/* ==========================================================
   Continue in Part 4
========================================================== */
/* ==========================================================
   DELETE ACADEMIC WORK
========================================================== */

export const deleteAcademicWork =
  async (
    req,
    res
  ) => {
    try {

      const work =
        await AcademicWork.findById(
          req.params.id
        );

      if (!work) {

        return errorResponse(
          res,
          "Academic activity not found.",
          404
        );

      }

      /* ==========================================
         DELETE MAIN IMAGE
      ========================================== */

      if (
        work.imagePublicId
      ) {

        await deleteFromCloudinary(
          work.imagePublicId,
          "image"
        );

      }

      /* ==========================================
         DELETE GALLERY
      ========================================== */

      if (
        work.gallery?.length
      ) {

        for (const item of work.gallery) {

          if (
            item.publicId
          ) {

            await deleteFromCloudinary(
              item.publicId,
              "image"
            );

          }

        }

      }

      await work.deleteOne();

      return successResponse(
        res,
        "Academic work deleted successfully."
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete academic work."
      );

    }
  };

/* ==========================================================
   DELETE ALL ACADEMIC WORKS
========================================================== */

export const deleteAllAcademicWorks =
  async (
    req,
    res
  ) => {
    try {

      const works =
        await AcademicWork.find();

      for (const work of works) {

        if (
          work.imagePublicId
        ) {

          await deleteFromCloudinary(
            work.imagePublicId,
            "image"
          );

        }

        if (
          work.gallery?.length
        ) {

          for (const item of work.gallery) {

            if (
              item.publicId
            ) {

              await deleteFromCloudinary(
                item.publicId,
                "image"
              );

            }

          }

        }

      }

      await AcademicWork.deleteMany(
        {}
      );

      return successResponse(
        res,
        "All academic works deleted successfully."
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete academic works."
      );

    }
  };

/* ==========================================================
   TOGGLE FEATURED
========================================================== */

export const toggleFeatured =
  async (
    req,
    res
  ) => {
    try {

      const work =
        await AcademicWork.findById(
          req.params.id
        );

      if (!work) {

        return errorResponse(
          res,
          "Academic activity not found.",
          404
        );

      }

      work.featured =
        !work.featured;

      await work.save();

      return successResponse(
        res,
        `Academic work ${
          work.featured
            ? "marked as featured"
            : "removed from featured"
        }.`,
        work
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to update featured status."
      );

    }
  };