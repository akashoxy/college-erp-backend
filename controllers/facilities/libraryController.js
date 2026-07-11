import Library from "../../models/facilities/Library.js";

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

  }

  catch {

    return defaultValue;

  }

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

const getImageFile = (
  files,
  field
) => {

  return files?.[
    field
  ]?.[0];

};

const getIndexedFile = (
  files,
  field,
  index
) => {

  return files?.[
    field
  ]?.[
    index
  ];

};


/* ==========================================================
   CREATE / UPDATE LIBRARY
   (Single Document CMS)
========================================================== */

export const createOrUpdateLibrary =
  async (req, res) => {

    try {

      let library =
        await Library.findOne();

      /* ======================================
         SIDE IMAGE
      ====================================== */

      let sideImage =
        library?.sideImage || "";

      let sideImagePublicId =
        library?.sideImagePublicId || "";

      /* ======================================
         IMAGE URL SUPPORT
      ====================================== */

      if (
        useImageUrl(
          req.body.sideImage
        )
      ) {

        if (
          library?.sideImagePublicId
        ) {

          await removeImage(
            library.sideImagePublicId
          );

        }

        sideImage =
          req.body.sideImage;

        sideImagePublicId =
          "";

      }

      /* ======================================
         CLOUDINARY IMAGE
      ====================================== */

      else {

        const sideFile =
          getImageFile(
            req.files,
            "sideImage"
          );

        if (
          sideFile
        ) {

          if (
            library?.sideImagePublicId
          ) {

            await removeImage(
              library.sideImagePublicId
            );

          }

          const upload =
            await uploadImageToCloudinary(

              sideFile,

              "library"

            );

          sideImage =
            upload.secure_url;

          sideImagePublicId =
            upload.public_id;

        }

      }

      /* ======================================
         LIBRARIANS
      ====================================== */

      const librarianData =
        parseJSON(
          req.body.librarians
        );

      const librarians = [];

      for (

        let i = 0;

        i < librarianData.length;

        i++

      ) {

        const oldLibrarian =
          library?.librarians?.[
            i
          ] || {};

        let avatar =
          oldLibrarian.avatar ||
          "";

        let avatarPublicId =
          oldLibrarian.avatarPublicId ||
          "";

        /* ===============================
           IMAGE URL
        =============================== */

        if (
          useImageUrl(
            librarianData[i]
              ?.avatar
          )
        ) {

          if (
            oldLibrarian.avatarPublicId
          ) {

            await removeImage(
              oldLibrarian.avatarPublicId
            );

          }

          avatar =
            librarianData[i]
              .avatar;

          avatarPublicId =
            "";

        }

        /* ===============================
           CLOUDINARY IMAGE
        =============================== */

        else {

          const avatarFile =
            getIndexedFile(

              req.files,

              "teacherAvatar",

              i

            );

          if (
            avatarFile
          ) {

            if (
              oldLibrarian.avatarPublicId
            ) {

              await removeImage(
                oldLibrarian.avatarPublicId
              );

            }

            const upload =
              await uploadImageToCloudinary(

                avatarFile,

                "library/librarians"

              );

            avatar =
              upload.secure_url;

            avatarPublicId =
              upload.public_id;

          }

        }

        librarians.push({

          avatar,

          avatarPublicId,

          name:
            librarianData[i]
              ?.name
              ?.trim() || "",

          designation:
            librarianData[i]
              ?.designation
              ?.trim() || "",

          qualification:
            librarianData[i]
              ?.qualification
              ?.trim() || "",

        });

      }

     
            /* ======================================
         E-BOOKS
      ====================================== */

      const ebookData =
        parseJSON(
          req.body.ebooks
        );

      const ebooks = [];

      for (

        let i = 0;

        i < ebookData.length;

        i++

      ) {

        const oldBook =
          library?.ebooks?.[
            i
          ] || {};

        let pdfFile =
          oldBook.pdfFile || "";

        let pdfPublicId =
          oldBook.pdfPublicId || "";

        /* ===============================
           PDF URL SUPPORT
        =============================== */

        if (
          usePdfUrl(
            ebookData[i]
              ?.pdfFile
          )
        ) {

          if (
            oldBook.pdfPublicId
          ) {

            await removePdf(
              oldBook.pdfPublicId
            );

          }

          pdfFile =
            ebookData[i]
              .pdfFile;

          pdfPublicId =
            "";

        }

        /* ===============================
           CLOUDINARY PDF
        =============================== */

        else {

          const pdf =
            getIndexedFile(

              req.files,

              "ebookPdf",

              i

            );

          if (
            pdf
          ) {

            if (
              oldBook.pdfPublicId
            ) {

              await removePdf(
                oldBook.pdfPublicId
              );

            }

            const upload =
              await uploadPdfToCloudinary(

                pdf,

                "library/ebooks"

              );

            pdfFile =
              upload.secure_url;

            pdfPublicId =
              upload.public_id;

          }

        }

        ebooks.push({

          title:
            ebookData[i]
              ?.title
              ?.trim() || "",

          author:
            ebookData[i]
              ?.author
              ?.trim() || "",

          category:
            ebookData[i]
              ?.category
              ?.trim() || "",

          pdfFile,

          pdfPublicId,

        });

      }

      /* ======================================
         PREPARE PAYLOAD
      ====================================== */

      const payload = {
  paragraph: req.body.paragraph?.trim() || library?.paragraph || "",

  onlineLibrary:
    req.body.onlineLibrary?.trim() ||
    library?.onlineLibrary ||
    "",

  readingRoom:
    req.body.readingRoom?.trim() ||
    library?.readingRoom ||
    "",

  sideImage,
  sideImagePublicId,

  librarians,
  ebooks,
};

      /* ======================================
         UPDATE
      ====================================== */

      if (
        library
      ) {

        const updated =
          await Library.findByIdAndUpdate(

            library._id,

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

          "Library updated successfully.",

          updated

        );

      }

      /* ======================================
         CREATE
      ====================================== */

      const created =
        await Library.create(
          payload
        );

      return successResponse(

        res,

        201,

        "Library created successfully.",

        created

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to save Library.",

        error.message

      );

    }

  };


/* ==========================================================
   GET LIBRARY
========================================================== */

export const getLibrary =
  async (req, res) => {

    try {

      const library =
        await Library.findOne().lean();

      return successResponse(

        res,

        200,

        "Library fetched successfully.",

        library

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to fetch Library.",

        error.message

      );

    }

  };

/* ==========================================================
   DELETE LIBRARY
========================================================== */

export const deleteLibrary =
  async (req, res) => {

    try {

      const library =
        await Library.findOne();

      if (!library) {

        return errorResponse(

          res,

          404,

          "Library data not found."

        );

      }

      /* ======================================
         DELETE SIDE IMAGE
      ====================================== */

      if (
        library.sideImagePublicId
      ) {

        await removeImage(
          library.sideImagePublicId
        );

      }

      /* ======================================
         DELETE LIBRARIAN AVATARS
      ====================================== */

      if (
        Array.isArray(
          library.librarians
        )
      ) {

        for (const librarian of library.librarians) {

          if (
            librarian.avatarPublicId
          ) {

            await removeImage(
              librarian.avatarPublicId
            );

          }

        }

      }

      /* ======================================
         DELETE EBOOK PDFS
      ====================================== */

      if (
        Array.isArray(
          library.ebooks
        )
      ) {

        for (const ebook of library.ebooks) {

          if (
            ebook.pdfPublicId
          ) {

            await removePdf(
              ebook.pdfPublicId
            );

          }

        }

      }

      /* ======================================
         DELETE DOCUMENT
      ====================================== */

      await Library.findByIdAndDelete(
        library._id
      );

      return successResponse(

        res,

        200,

        "Library deleted successfully."

      );

    } catch (error) {

      return errorResponse(

        res,

        500,

        "Failed to delete Library.",

        error.message

      );

    }

  };