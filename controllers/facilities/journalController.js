import Journal from "../../models/facilities/Journal.js";

import {
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
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

const usePdfUrl = (
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

const removePdf =
  async (
    publicId
  ) => {

    if (!publicId)
      return;

    try {

      await deleteFromCloudinary(

        publicId,

        "raw"

      );

    }

    catch {}

  };

/* ==========================================================
   FILE HELPERS
========================================================== */

const getFile = (
  files,
  fieldName
) => {

  if (!files)
    return null;

  return files?.[
    fieldName
  ]?.[0] || null;

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

const uploadPdf =
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

    return await uploadPdfToCloudinary(

      file,

      folder

    );

  };


/* ==========================================================
   GET JOURNAL
========================================================== */

export const getJournal =
  async (req, res) => {

    try {

      let journal =
        await Journal.findOne().lean();

      if (!journal) {

        const created =
          await Journal.create({

            bannerImage: "",
            bannerImagePublicId: "",

            paragraph: "",

            journalList: [],

            sideImage: "",
            sideImagePublicId: "",

            researchPublications: [],

          });

        journal =
          created.toObject();

      }

      return successResponse(

        res,

        200,

        "Journal fetched successfully.",

        journal

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to fetch Journal.",

        error.message

      );

    }

  };

/* ==========================================================
   CREATE / UPDATE JOURNAL
   (Single Document CMS)
========================================================== */

export const createOrUpdateJournal =
  async (req, res) => {

    try {

      let journal =
        await Journal.findOne();

      /* ======================================
         EXISTING IMAGES
      ====================================== */

      let bannerImage =
        journal?.bannerImage || "";

      let bannerImagePublicId =
        journal?.bannerImagePublicId || "";

      let sideImage =
        journal?.sideImage || "";

      let sideImagePublicId =
        journal?.sideImagePublicId || "";

      const bannerFile =
        getFile(
          req.files,
          "bannerImage"
        );

      const sideFile =
        getFile(
          req.files,
          "sideImage"
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
          journal?.bannerImagePublicId
        ) {

          await removeImage(
            journal.bannerImagePublicId
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
          journal?.bannerImagePublicId
        ) {

          await removeImage(
            journal.bannerImagePublicId
          );

        }

        const upload =
          await uploadImage(

            bannerFile,

            "journals/banner"

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
          journal?.sideImagePublicId
        ) {

          await removeImage(
            journal.sideImagePublicId
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
          journal?.sideImagePublicId
        ) {

          await removeImage(
            journal.sideImagePublicId
          );

        }

        const upload =
          await uploadImage(

            sideFile,

            "journals/research"

          );

        sideImage =
          upload.secure_url;

        sideImagePublicId =
          upload.public_id;

      }

      /* ======================================
         JOURNAL LIST
      ====================================== */

      let journalList =
        journal?.journalList || [];

      if (
        req.body.journalList
      ) {

        try {

          journalList =
            JSON.parse(
              req.body.journalList
            );

        }

        catch {

          journalList =
            [];

        }

      }

      /* ======================================
         PAYLOAD
      ====================================== */

      const payload = {

        bannerImage,
        bannerImagePublicId,

        paragraph:

          // Use ?? rather than || here: an intentionally
          // cleared field arrives as an empty string, which
          // is falsy but not nullish. || would silently
          // discard that and keep the old paragraph forever;
          // ?? only falls back when the field wasn't sent.
          req.body.paragraph?.trim()

          ??

          journal?.paragraph

          ??

          "",

        journalList,

        sideImage,
        sideImagePublicId,

      };

      /* ======================================
         UPDATE
      ====================================== */

      if (
        journal
      ) {

        const updated =
          await Journal.findByIdAndUpdate(

            journal._id,

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

          "Journal updated successfully.",

          updated

        );

      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await Journal.create({

          ...payload,

          researchPublications: [],

        });

      return successResponse(

        res,

        201,

        "Journal created successfully.",

        created

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to save Journal.",

        error.message

      );

    }

  };


/* ==========================================================
   ADD RESEARCH PUBLICATION
========================================================== */

export const addPublication =
  async (req, res) => {

    try {

      const journal =
        await Journal.findOne();

      if (!journal) {

        return errorResponse(

          res,

          404,

          "Journal CMS not found."

        );

      }

      /* ======================================
         PDF
      ====================================== */

      let pdfUrl = "";

      let pdfPublicId = "";

      const pdfFile =
        getFile(
          req.files,
          "pdfFile"
        );

      /* ===============================
         PDF URL SUPPORT
      =============================== */

      if (
        usePdfUrl(
          req.body.pdfUrl
        )
      ) {

        pdfUrl =
          req.body.pdfUrl;

      }

      /* ===============================
         CLOUDINARY PDF
      =============================== */

      else if (
        pdfFile
      ) {

        const upload =
          await uploadPdf(

            pdfFile,

            "journals/publications"

          );

        pdfUrl =
          upload.secure_url;

        pdfPublicId =
          upload.public_id;

      }

      /* ======================================
         ADD PUBLICATION
      ====================================== */

      journal.researchPublications.push({

        title:

          req.body.title?.trim()

          ||

          "",

        authors:

          req.body.authors?.trim()

          ||

          "",

        description:

          req.body.description?.trim()

          ||

          "",

        websiteUrl:

          req.body.websiteUrl?.trim()

          ||

          "",

        pdfUrl,

        pdfPublicId,

      });

      await journal.save();

      return successResponse(

        res,

        201,

        "Research publication added successfully.",

        journal

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to add research publication.",

        error.message

      );

    }

  };

/* ==========================================================
   UPDATE RESEARCH PUBLICATION
========================================================== */

export const updatePublication =
  async (req, res) => {

    try {

      const {
        publicationId,
      } = req.params;

      const journal =
        await Journal.findOne();

      if (!journal) {

        return errorResponse(

          res,

          404,

          "Journal CMS not found."

        );

      }

      const publication =
        journal.researchPublications.id(

          publicationId

        );

      if (!publication) {

        return errorResponse(

          res,

          404,

          "Research publication not found."

        );

      }

      /* ======================================
         BASIC FIELDS
      ====================================== */

      publication.title =

        req.body.title?.trim()

        ??

        publication.title;

      publication.authors =

        req.body.authors?.trim()

        ??

        publication.authors;

      publication.description =

        req.body.description?.trim()

        ??

        publication.description;

      publication.websiteUrl =

        req.body.websiteUrl?.trim()

        ??

        publication.websiteUrl;

      /* ======================================
         PDF
      ====================================== */

      const pdfFile =
        getFile(

          req.files,

          "pdfFile"

        );

      /* ===============================
         EXTERNAL PDF URL
      =============================== */

      if (
        usePdfUrl(
          req.body.pdfUrl
        )
      ) {

        if (
          publication.pdfPublicId
        ) {

          await removePdf(

            publication.pdfPublicId

          );

        }

        publication.pdfUrl =
          req.body.pdfUrl;

        publication.pdfPublicId =
          "";

      }

      /* ===============================
         CLOUDINARY PDF
      =============================== */

      else if (
        pdfFile
      ) {

        if (
          publication.pdfPublicId
        ) {

          await removePdf(

            publication.pdfPublicId

          );

        }

        const upload =
          await uploadPdf(

            pdfFile,

            "journals/publications"

          );

        publication.pdfUrl =
          upload.secure_url;

        publication.pdfPublicId =
          upload.public_id;

      }

      /* ======================================
         SAVE
      ====================================== */

      await journal.save();

      return successResponse(

        res,

        200,

        "Research publication updated successfully.",

        journal

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to update research publication.",

        error.message

      );

    }

  };


/* ==========================================================
   DELETE RESEARCH PUBLICATION
========================================================== */

export const deletePublication =
  async (req, res) => {

    try {

      const {
        publicationId,
      } = req.params;

      const journal =
        await Journal.findOne();

      if (!journal) {

        return errorResponse(

          res,

          404,

          "Journal CMS not found."

        );

      }

      const publication =
        journal.researchPublications.id(

          publicationId

        );

      if (!publication) {

        return errorResponse(

          res,

          404,

          "Research publication not found."

        );

      }

      /* ======================================
         DELETE CLOUDINARY PDF
      ====================================== */

      if (
        publication.pdfPublicId
      ) {

        await removePdf(

          publication.pdfPublicId

        );

      }

      /* ======================================
         REMOVE PUBLICATION
      ====================================== */

      publication.deleteOne();

      await journal.save();

      return successResponse(

        res,

        200,

        "Research publication deleted successfully.",

        journal

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete research publication.",

        error.message

      );

    }

  };

/* ==========================================================
   DELETE JOURNAL CMS
========================================================== */

export const deleteJournal =
  async (req, res) => {

    try {

      const journal =
        await Journal.findOne();

      if (!journal) {

        return errorResponse(

          res,

          404,

          "Journal CMS not found."

        );

      }

      /* ======================================
         DELETE BANNER IMAGE
      ====================================== */

      if (
        journal.bannerImagePublicId
      ) {

        await removeImage(

          journal.bannerImagePublicId

        );

      }

      /* ======================================
         DELETE SIDE IMAGE
      ====================================== */

      if (
        journal.sideImagePublicId
      ) {

        await removeImage(

          journal.sideImagePublicId

        );

      }

      /* ======================================
         DELETE PUBLICATION PDFS
      ====================================== */

      if (
        Array.isArray(
          journal.researchPublications
        )
      ) {

        for (const publication of journal.researchPublications) {

          if (
            publication.pdfPublicId
          ) {

            await removePdf(

              publication.pdfPublicId

            );

          }

        }

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await Journal.findByIdAndDelete(

        journal._id

      );

      return successResponse(

        res,

        200,

        "Journal CMS deleted successfully."

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete Journal CMS.",

        error.message

      );

    }

  };