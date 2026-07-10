import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/* ==================================================
   RESOURCE TYPE DETECTION
================================================== */

export const getResourceType = (mimetype = "") => {

  if (mimetype.startsWith("image/")) {
    return "image";
  }

  if (mimetype.startsWith("video/")) {
    return "video";
  }

  if (mimetype === "application/pdf") {
    return "auto";
  }

  return "raw";

};

/* ==================================================
   UNIVERSAL UPLOAD
================================================== */

export const uploadToCloudinary = async (
  file,
  folder = "uploads",
  resourceType = null
) => {

  if (!file) {
    throw new Error("No file provided.");
  }

  const buffer = Buffer.isBuffer(file)
    ? file
    : file.buffer;

  if (!Buffer.isBuffer(buffer)) {
    throw new Error(
      "uploadToCloudinary expects a Buffer or Multer file object."
    );
  }

  const type =
    resourceType ||
    getResourceType(file.mimetype || "");

  return new Promise((resolve, reject) => {

         const options = {
  folder,
  resource_type: type,

  use_filename: true,
  unique_filename: true,
  overwrite: false,
};

if (
  type !== "raw" &&
  file.originalname
) {
  options.filename_override =
    file.originalname.replace(
      /\.[^/.]+$/,
      ""
    );
}

    const uploadStream =
      cloudinary.uploader.upload_stream(

          options,

        (error, result) => {

          if (error) {

            console.error(
              "Cloudinary Upload Error:",
              error
            );

            return reject(error);

          }

          /* ==========================================
             Backward Compatible Response
          ========================================== */

          const response = {

            // OLD (keep exactly)
            ...result,

            // OLD aliases
            url: result.secure_url,

            publicId: result.public_id,

            // NEW
            resourceType:
              result.resource_type,

            format:
              result.format,

            originalFilename:
              file.originalname,

          };


          resolve(response);

        }

      );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream);

  });

};

/* ==================================================
   IMAGE
================================================== */

export const uploadImageToCloudinary = (
  file,
  folder = "uploads/images"
) => {

  return uploadToCloudinary(
    file,
    folder,
    "image"
  );

};

/* ==================================================
   PDF / DOC / PPT
================================================== */

export const uploadPdfToCloudinary = (
  file,
  folder = "uploads/files"
) => {

  return uploadToCloudinary(
    file,
    folder,
    "auto"
  );

};


/* ==================================================
   VIDEO
================================================== */

export const uploadVideoToCloudinary = (
  file,
  folder = "uploads/videos"
) => {

  return uploadToCloudinary(
    file,
    folder,
    "video"
  );

};

/* ==================================================
   DELETE FILE
================================================== */

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {

  try {

    if (!publicId) return null;

    return await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
      }
    );

  } catch (error) {

    console.error(
      "Cloudinary Delete Error:",
      error
    );

    return null;

  }

};

/* ==================================================
   GET PUBLIC ID FROM CLOUDINARY URL
================================================== */

export const getPublicIdFromUrl = (
  url
) => {

  try {

    if (!url) return null;

    const uploadIndex =
      url.indexOf("/upload/");

    if (uploadIndex === -1)
      return null;

    let publicId =
      url.substring(
        uploadIndex + 8
      );

    publicId =
      publicId.replace(
        /^v\d+\//,
        ""
      );

    publicId =
      publicId.substring(
        0,
        publicId.lastIndexOf(".")
      );

    return publicId;

  } catch {

    return null;

  }

};

/* ==================================================
   DELETE USING URL
================================================== */

export const deleteFromCloudinaryUrl =
  async (
    url,
    resourceType = "image"
  ) => {

    try {

      const publicId =
        getPublicIdFromUrl(url);

      if (!publicId)
        return null;

      return await deleteFromCloudinary(
        publicId,
        resourceType
      );

    } catch (error) {

      console.error(
        "Cloudinary Delete URL Error:",
        error
      );

      return null;

    }

  };

/* ==================================================
   BACKWARD COMPATIBILITY
================================================== */

export const deleteFileFromCloudinary =
  deleteFromCloudinary;

export const uploadFileToCloudinary =
  uploadPdfToCloudinary;

export default {
  uploadToCloudinary,
  uploadImageToCloudinary,
  uploadPdfToCloudinary,
  uploadVideoToCloudinary,
  uploadFileToCloudinary,
  deleteFromCloudinary,
  deleteFileFromCloudinary,
  deleteFromCloudinaryUrl,
  getPublicIdFromUrl,
};