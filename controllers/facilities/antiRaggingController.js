import AntiRagging from "../../models/facilities/AntiRagging.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

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

const parseRequestData =
  (req) => {

    try {

      return JSON.parse(
        req.body.data || "{}"
      );

    } catch {

      return {};

    }

  };

const preserveValue = (
  newValue,
  oldValue
) => {

  return (
    newValue ??
    oldValue ??
    ""
  );

};

const useImageUrl =
  (value) => {

    return (
      typeof value ===
        "string" &&
      value.startsWith(
        "http"
      )
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

    if (
      !file.mimetype.startsWith(
        "image/"
      )
    ) {

      throw new Error(
        "Only image files are allowed."
      );

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

    } catch (error) {

      console.error(
        "Cloudinary Delete Error:",
        error.message
      );

    }

  };

/* ==========================================================
   SAVE ANTI RAGGING
========================================================== */

export const saveAntiRagging =
  async (req, res) => {

    try {

      let antiRagging =
        await AntiRagging.findOne();

      const data =
        parseRequestData(req);

      const files =
        req.files || [];

      /* ======================================
         HERO IMAGE
      ====================================== */

      const heroFile =
        getFileByField(
          files,
          "heroBackgroundImage"
        );

     if (
        heroFile
      ) {

        if (
          antiRagging
            ?.heroBackgroundImagePublicId
        ) {

          await removeImage(
            antiRagging.heroBackgroundImagePublicId
          );

        }

        const upload =
          await uploadImage(
            heroFile,
            "anti-ragging/hero"
          );

        data.heroBackgroundImage =
          upload.secure_url;

        data.heroBackgroundImagePublicId =
          upload.public_id;

      }

      else if (
        useImageUrl(
          data.heroBackgroundImage
        )
      ) {

        if (
          antiRagging
            ?.heroBackgroundImagePublicId
        ) {

          await removeImage(
            antiRagging.heroBackgroundImagePublicId
          );

        }

        data.heroBackgroundImagePublicId =
          "";

      }

      else {

        data.heroBackgroundImage =
          preserveValue(
            data.heroBackgroundImage,
            antiRagging?.heroBackgroundImage
          );

        data.heroBackgroundImagePublicId =
          antiRagging
            ?.heroBackgroundImagePublicId ||
          "";

      }

      /* ======================================
         POSTERS
      ====================================== */

      if (
        Array.isArray(
          data.posters
        )
      ) {

        for (
          let i = 0;
          i <
          data.posters.length;
          i++
        ) {

          const poster =
            data.posters[i];

          const posterFile =
            getFileByField(
              files,
              `posterImage_${i}`
            );

          /* ===============================
             EXTERNAL URL
          =============================== */

          if (
            useImageUrl(
              poster.image
            )
          ) {

            if (
              antiRagging
                ?.posters?.[
                i
              ]?.imagePublicId
            ) {

              await removeImage(
                antiRagging
                  .posters[i]
                  .imagePublicId
              );

            }

            poster.imagePublicId =
              "";

          }

          /* ===============================
             CLOUDINARY IMAGE
          =============================== */

          else if (
            posterFile
          ) {

            if (
              antiRagging
                ?.posters?.[
                i
              ]?.imagePublicId
            ) {

              await removeImage(
                antiRagging
                  .posters[i]
                  .imagePublicId
              );

            }

            const upload =
              await uploadImage(
                posterFile,
                "anti-ragging/posters"
              );

            poster.image =
              upload.secure_url;

            poster.imagePublicId =
              upload.public_id;

          }

          /* ===============================
             KEEP EXISTING
          =============================== */

          else if (
            antiRagging
              ?.posters?.[
              i
            ]
          ) {

            poster.image =
              preserveValue(
                poster.image,
                antiRagging
                  .posters[i]
                  .image
              );

            poster.imagePublicId =
              antiRagging
                .posters[i]
                .imagePublicId ||
              "";

          }

        }

      }
            /* ======================================
         COMMITTEE MEMBERS
      ====================================== */

      if (
        Array.isArray(
          data.committeeMembers
        )
      ) {

        for (
          let i = 0;
          i <
          data.committeeMembers.length;
          i++
        ) {

          const member =
            data.committeeMembers[
              i
            ];

          const memberFile =
            getFileByField(
              files,
              `committeeImage_${i}`
            );

          /* ===============================
             EXTERNAL IMAGE URL
          =============================== */

          if (
            useImageUrl(
              member.image
            )
          ) {

            if (
              antiRagging
                ?.committeeMembers?.[
                i
              ]?.imagePublicId
            ) {

              await removeImage(
                antiRagging
                  .committeeMembers[
                  i
                ].imagePublicId
              );

            }

            member.imagePublicId =
              "";

          }

          /* ===============================
             CLOUDINARY IMAGE
          =============================== */

          else if (
            memberFile
          ) {

            if (
              antiRagging
                ?.committeeMembers?.[
                i
              ]?.imagePublicId
            ) {

              await removeImage(
                antiRagging
                  .committeeMembers[
                  i
                ].imagePublicId
              );

            }

            const upload =
              await uploadImage(
                memberFile,
                "anti-ragging/committee"
              );

            member.image =
              upload.secure_url;

            member.imagePublicId =
              upload.public_id;

          }

          /* ===============================
             KEEP EXISTING IMAGE
          =============================== */

          else if (
            antiRagging
              ?.committeeMembers?.[
              i
            ]
          ) {

            member.image =
              preserveValue(
                member.image,
                antiRagging
                  .committeeMembers[
                  i
                ].image
              );

            member.imagePublicId =
              antiRagging
                .committeeMembers[
                i
              ].imagePublicId ||
              "";

          }

        }

      }

      /* ======================================
         FEATURES
      ====================================== */

      if (
        Array.isArray(
          data.features
        )
      ) {

        for (
          let i = 0;
          i <
          data.features.length;
          i++
        ) {

          const feature =
            data.features[i];

          const featureFile =
            getFileByField(
              files,
              `featureIcon_${i}`
            );

          /* ===============================
             EXTERNAL ICON URL
          =============================== */

          if (
            useImageUrl(
              feature.icon
            )
          ) {

            if (
              antiRagging
                ?.features?.[
                i
              ]?.iconPublicId
            ) {

              await removeImage(
                antiRagging
                  .features[
                  i
                ].iconPublicId
              );

            }

            feature.iconPublicId =
              "";

          }

          /* ===============================
             CLOUDINARY ICON
          =============================== */

          else if (
            featureFile
          ) {

            if (
              antiRagging
                ?.features?.[
                i
              ]?.iconPublicId
            ) {

              await removeImage(
                antiRagging
                  .features[
                  i
                ].iconPublicId
              );

            }

            const upload =
              await uploadImage(
                featureFile,
                "anti-ragging/features"
              );

            feature.icon =
              upload.secure_url;

            feature.iconPublicId =
              upload.public_id;

          }

          /* ===============================
             KEEP EXISTING ICON
          =============================== */

          else if (
            antiRagging
              ?.features?.[
              i
            ]
          ) {

            feature.icon =
              preserveValue(
                feature.icon,
                antiRagging
                  .features[
                  i
                ].icon
              );

            feature.iconPublicId =
              antiRagging
                .features[
                i
              ].iconPublicId ||
              "";

          }

        }

      }

      /* ======================================
         CREATE / UPDATE
      ====================================== */

      if (
        antiRagging
      ) {

        antiRagging =
          await AntiRagging.findByIdAndUpdate(
            antiRagging._id,
            {
              $set: data,
            },
            {
              new: true,
              runValidators: true,
            }
          );

        return successResponse(
          res,
          200,
          "Anti Ragging page updated successfully.",
          antiRagging
        );

      }

      antiRagging =
        await AntiRagging.create(
          data
        );

      return successResponse(
        res,
        201,
        "Anti Ragging page created successfully.",
        antiRagging
      );

    } catch (error) {

      console.error(
        "Save Anti Ragging Error:",
        error
      );

      return errorResponse(
        res,
        500,
        "Failed to save Anti Ragging data.",
        error.message
      );

    }

  };
  /* ==========================================================
   GET ANTI RAGGING
========================================================== */

export const getAntiRagging =
  async (req, res) => {

    try {

      let antiRagging =
        await AntiRagging.findOne().lean();

      /* ======================================
         CREATE DEFAULT DOCUMENT
      ====================================== */

      if (!antiRagging) {

        const created =
          await AntiRagging.create({

            /* HERO */

            heroTitle: "",

            heroSubtitle: "",

            heroBackgroundImage: "",

            heroBackgroundImagePublicId: "",

            /* INTRODUCTION */

            introductionTitle: "",

            introductionDescription: "",

            /* POSTERS */

            posters: [],

            /* COMMITTEE */

            committeeTitle: "",

            committeeDescription: "",

            committeeMembers: [],

            /* FEATURES */

            features: [],

          });

        antiRagging =
          created.toObject();

      }

      return successResponse(

        res,

        200,

        "Anti Ragging data fetched successfully.",

        antiRagging

      );

    }

    catch (error) {

      console.error(

        "Get Anti Ragging Error:",

        error

      );

      return errorResponse(

        res,

        500,

        "Failed to fetch Anti Ragging data.",

        error.message

      );

    }

  };
  /* ==========================================================
   DELETE ANTI RAGGING
========================================================== */

export const deleteAntiRagging =
  async (req, res) => {

    try {

      const antiRagging =
        await AntiRagging.findOne();

      if (!antiRagging) {

        return errorResponse(
          res,
          404,
          "Anti Ragging CMS not found."
        );

      }

      /* ======================================
         HERO IMAGE
      ====================================== */

      if (
        antiRagging.heroBackgroundImagePublicId
      ) {

        await removeImage(
          antiRagging.heroBackgroundImagePublicId
        );

      }

      /* ======================================
         POSTERS
      ====================================== */

      if (
        Array.isArray(
          antiRagging.posters
        )
      ) {

        await Promise.all(

          antiRagging.posters.map(
            async (poster) => {

              if (
                poster.imagePublicId
              ) {

                await removeImage(
                  poster.imagePublicId
                );

              }

            }
          )

        );

      }

      /* ======================================
         COMMITTEE MEMBERS
      ====================================== */

      if (
        Array.isArray(
          antiRagging.committeeMembers
        )
      ) {

        await Promise.all(

          antiRagging.committeeMembers.map(
            async (member) => {

              if (
                member.imagePublicId
              ) {

                await removeImage(
                  member.imagePublicId
                );

              }

            }
          )

        );

      }

      /* ======================================
         FEATURE ICONS
      ====================================== */

      if (
        Array.isArray(
          antiRagging.features
        )
      ) {

        await Promise.all(

          antiRagging.features.map(
            async (feature) => {

              if (
                feature.iconPublicId
              ) {

                await removeImage(
                  feature.iconPublicId
                );

              }

            }
          )

        );

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await AntiRagging.findByIdAndDelete(
        antiRagging._id
      );

      return successResponse(
        res,
        200,
        "Anti Ragging CMS deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete Anti Ragging Error:",
        error
      );

      return errorResponse(
        res,
        500,
        "Failed to delete Anti Ragging CMS.",
        error.message
      );

    }

  };