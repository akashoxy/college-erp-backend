import ComputerLaboratory from "../../models/facilities/ComputerLab.js";

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

const parseJSON = (
  value,
  defaultValue = []
) => {
  try {
    if (!value)
      return defaultValue;

    return typeof value ===
      "string"
      ? JSON.parse(value)
      : value;
  } catch {
    return defaultValue;
  }
};

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

const getFilesByField = (
  files,
  fieldName
) => {

  return (
    files || []
  ).filter(
    (file) =>
      file.fieldname ===
      fieldName
  );

};

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

    } catch {}

  };

/* ==========================================================
   IMAGE URL SUPPORT
========================================================== */

const useImageUrl = (
  url
) => {

  return (

    typeof url ===
      "string" &&

    url.startsWith(
      "http"
    )

  );

};

/* ==========================================================
   PART 2 STARTS HERE

   saveComputerLaboratory()

   - Load Existing Document
   - Parse JSON
   - Banner Upload
   - Side Image Upload

========================================================== */
/* ==========================================================
   CREATE / UPDATE
   (Single Document CMS)
========================================================== */

export const saveComputerLaboratory =
  async (req, res) => {

    try {

      let laboratory =
        await ComputerLaboratory.findOne();

      const files =
        req.files || [];

      const bannerFile =
        getFileByField(
          files,
          "bannerImage"
        );

      const sideFile =
        getFileByField(
          files,
          "sideImage"
        );

      const uploadedLabImages =
        getFilesByField(
          files,
          "labImages"
        );

      /* ======================================
         EXISTING VALUES
      ====================================== */

      let bannerImage =
        laboratory?.bannerImage || "";

      let bannerImagePublicId =
        laboratory?.bannerImagePublicId || "";

      let sideImage =
        laboratory?.sideImage || "";

      let sideImagePublicId =
        laboratory?.sideImagePublicId || "";

      const facilities =
        parseJSON(

          req.body.facilities,

          laboratory?.facilities || []

        );

        const cleanedFacilities =
    facilities
        .map(item => item.trim())
        .filter(Boolean);

      let laboratoryUnits =
        parseJSON(

          req.body.laboratoryUnits,

          laboratory?.laboratoryUnits || []

        );

      /* ======================================
         BANNER IMAGE
      ====================================== */

      if (
        useImageUrl(
          req.body.bannerImage
        )
      ) {

        if (
          laboratory?.bannerImagePublicId
        ) {

          await removeImage(

            laboratory.bannerImagePublicId

          );

        }

        bannerImage =
          req.body.bannerImage;

        bannerImagePublicId =
          "";

      }

      else if (
        bannerFile
      ) {

        if (
          laboratory?.bannerImagePublicId
        ) {

          await removeImage(

            laboratory.bannerImagePublicId

          );

        }

        const upload =
          await uploadImage(

            bannerFile,

            "computer-lab/banner"

          );

        bannerImage =
          upload.secure_url;

        bannerImagePublicId =
          upload.public_id;

      }

      /* ======================================
         SIDE IMAGE
      ====================================== */

      if (
        useImageUrl(
          req.body.sideImage
        )
      ) {

        if (
          laboratory?.sideImagePublicId
        ) {

          await removeImage(

            laboratory.sideImagePublicId

          );

        }

        sideImage =
          req.body.sideImage;

        sideImagePublicId =
          "";

      }

      else if (
        sideFile
      ) {

        if (
          laboratory?.sideImagePublicId
        ) {

          await removeImage(

            laboratory.sideImagePublicId

          );

        }

        const upload =
          await uploadImage(

            sideFile,

            "computer-lab/side"

          );

        sideImage =
          upload.secure_url;

        sideImagePublicId =
          upload.public_id;

      }

      /* ======================================
         PART 3 STARTS HERE

         Laboratory Unit Images
         Prepare Payload
         Create / Update

      ====================================== */
            /* ======================================
         LABORATORY UNIT IMAGES
      ====================================== */

      laboratoryUnits =
        await Promise.all(

          laboratoryUnits.map(

            async (
              lab,
              index
            ) => {

              const oldLab =

                laboratory
                  ?.laboratoryUnits?.[
                  index
                ] || {};

              let labImage =

                oldLab.labImage || "";

              let labImagePublicId =

                oldLab.labImagePublicId ||
                "";

              const currentImage =
                uploadedLabImages[
                  index
                ];

              /* ==============================
                 IMAGE URL SUPPORT
              ============================== */

              if (
                useImageUrl(
                  lab.labImage
                )
              ) {

                if (
                  oldLab.labImagePublicId
                ) {

                  await removeImage(

                    oldLab.labImagePublicId

                  );

                }

                labImage =
                  lab.labImage;

                labImagePublicId =
                  "";

              }

              /* ==============================
                 CLOUDINARY IMAGE
              ============================== */

              else if (
                currentImage
              ) {

                if (
                  oldLab.labImagePublicId
                ) {

                  await removeImage(

                    oldLab.labImagePublicId

                  );

                }

                const upload =
                  await uploadImage(

                    currentImage,

                    "computer-lab/labs"

                  );

                labImage =
                  upload.secure_url;

                labImagePublicId =
                  upload.public_id;

              }

              return {

                ...lab,

                labImage,

                labImagePublicId,

              };

            }

          )

        );

      /* ======================================
         PREPARE PAYLOAD
      ====================================== */

      const payload = {

        bannerImage,

        bannerImagePublicId,

        paragraph:

       (req.body.paragraph ?? "")
          .trim()

          ||

          laboratory?.paragraph

          ||

          "",

        facilities: cleanedFacilities,

        sideImage,

        sideImagePublicId,

        laboratoryUnits,

      };

      /* ======================================
         UPDATE
      ====================================== */

      if (
        laboratory
      ) {

        const updated =
          await ComputerLaboratory.findByIdAndUpdate(

            laboratory._id,

            {
              $set: payload,
            },

            {
    returnDocument:"after",
    runValidators:true
}

          );

        return successResponse(

          res,

          200,

          "Computer Laboratory updated successfully.",

          updated

        );

      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await ComputerLaboratory.create(
          payload
        );

      return successResponse(

        res,

        201,

        "Computer Laboratory created successfully.",

        created

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to save Computer Laboratory.",

        error.message

      );

    }

  };

/* ==========================================================
   PART 4 STARTS HERE

   getComputerLaboratory()

   deleteComputerLaboratory()

========================================================== */
/* ==========================================================
   GET COMPUTER LABORATORY
========================================================== */

export const getComputerLaboratory =
  async (req, res) => {

    try {

      const laboratory =
        await ComputerLaboratory.findOne().lean();

      return successResponse(

        res,

        200,

        "Computer Laboratory fetched successfully.",

        laboratory

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to fetch Computer Laboratory.",

        error.message

      );

    }

  };

/* ==========================================================
   DELETE COMPUTER LABORATORY
========================================================== */

export const deleteComputerLaboratory =
  async (req, res) => {

    try {

      const laboratory =
        await ComputerLaboratory.findOne();

      if (!laboratory) {

        return errorResponse(

          res,

          404,

          "Computer Laboratory data not found."

        );

      }

      /* ======================================
         DELETE BANNER
      ====================================== */

      if (
        laboratory.bannerImagePublicId
      ) {

        await removeImage(
          laboratory.bannerImagePublicId
        );

      }

      /* ======================================
         DELETE SIDE IMAGE
      ====================================== */

      if (
        laboratory.sideImagePublicId
      ) {

        await removeImage(
          laboratory.sideImagePublicId
        );

      }

      /* ======================================
         DELETE LABORATORY UNIT IMAGES
      ====================================== */

      if (
        Array.isArray(
          laboratory.laboratoryUnits
        )
      ) {

        for (const unit of laboratory.laboratoryUnits) {

          if (
            unit.labImagePublicId
          ) {

            await removeImage(
              unit.labImagePublicId
            );

          }

        }

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await ComputerLaboratory.findByIdAndDelete(
        laboratory._id
      );

      return successResponse(

        res,

        200,

        "Computer Laboratory deleted successfully."

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete Computer Laboratory.",

        error.message

      );

    }

  };