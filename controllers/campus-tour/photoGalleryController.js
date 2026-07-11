import PhotoGallery from "../../models/campus-tour/PhotoGallery.js";

import {
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from "../../utils/cloudinaryHelper.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/responseHandler.js";

/* ==========================================================
   ENSURE PHOTO GALLERY EXISTS
========================================================== */

const ensureGallery =
  async () => {

    let gallery =
      await PhotoGallery.findOne();

    if (!gallery) {

      gallery =
        await PhotoGallery.create({
          heroImages: [],
          featuredPhotos: [],
          yearFolders: [],
        });

    }

    return gallery;

  };

/* ==========================================================
   GET PHOTO GALLERY
========================================================== */

export const getPhotoGallery =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      return successResponse(
        res,
        "Photo Gallery fetched successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to fetch Photo Gallery."
      );

    }
  };

/* ==========================================================
   DELETE ALL PHOTO GALLERY DATA
========================================================== */

export const deleteAllPhotoGalleryData =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      /* ==========================
         COLLECT EVERY PUBLIC ID
      ========================== */

      const publicIds = [];

      for (const hero of gallery.heroImages) {

        if (hero.publicId) {
          publicIds.push(
            hero.publicId
          );
        }

      }

      for (const photo of gallery.featuredPhotos) {

        if (photo.publicId) {
          publicIds.push(
            photo.publicId
          );
        }

      }

      for (const year of gallery.yearFolders) {

        for (const album of year.albums) {

          if (album.publicId) {
            publicIds.push(
              album.publicId
            );
          }

          for (const photo of album.photos) {

            if (photo.publicId) {
              publicIds.push(
                photo.publicId
              );
            }

          }

        }

      }

      /* ==========================
         BEST-EFFORT CLOUDINARY CLEANUP
      ========================== */

      await Promise.allSettled(
        publicIds.map(
          (publicId) =>
            deleteFromCloudinary(
              publicId,
              "image"
            )
        )
      );

      /* ==========================
         RESET GALLERY DOCUMENT
      ========================== */

      gallery.heroImages = [];
      gallery.featuredPhotos = [];
      gallery.yearFolders = [];

      await gallery.save();

      return successResponse(
        res,
        "All photo gallery data deleted successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete all photo gallery data."
      );

    }
  };


/* ==========================================================
   UPLOAD HERO IMAGE
========================================================== */

export const uploadHeroImage =
  async (
    req,
    res
  ) => {
    try {

      if (!req.file) {
        return errorResponse(
          res,
          "Hero image is required.",
          400
        );
      }

      const gallery =
        await ensureGallery();

      const result =
        await uploadImageToCloudinary(
          req.file,
          "photo-gallery/hero"
        );

      gallery.heroImages.push({
        image:
          result.secure_url,
        publicId:
          result.public_id,
      });

      await gallery.save();

      return successResponse(
        res,
        "Hero image uploaded successfully.",
        gallery,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to upload hero image."
      );

    }
  };

/* ==========================================================
   DELETE HERO IMAGE
========================================================== */

export const deleteHeroImage =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      const heroImage =
        gallery.heroImages[
          Number(
            req.params.index
          )
        ];

      if (!heroImage) {
        return errorResponse(
          res,
          "Hero image not found.",
          404
        );
      }

      if (
        heroImage.publicId
      ) {
        await deleteFromCloudinary(
          heroImage.publicId,
          "image"
        );
      }

      gallery.heroImages.splice(
        Number(
          req.params.index
        ),
        1
      );

      await gallery.save();

      return successResponse(
        res,
        "Hero image deleted successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete hero image."
      );

    }
  };


/* ==========================================================
   ADD FEATURED PHOTO
========================================================== */

export const addFeaturedPhoto =
  async (
    req,
    res
  ) => {
    try {

      const {
        title,
        description,
      } = req.body;

      if (!req.file) {
        return errorResponse(
          res,
          "Featured image is required.",
          400
        );
      }

      const gallery =
        await ensureGallery();

      const result =
        await uploadImageToCloudinary(
          req.file,
          "photo-gallery/featured"
        );

      gallery.featuredPhotos.push({
        title,
        description,
        image:
          result.secure_url,
        publicId:
          result.public_id,
      });

      await gallery.save();

      return successResponse(
        res,
        "Featured photo added successfully.",
        gallery,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to add featured photo."
      );

    }
  };

/* ==========================================================
   UPDATE FEATURED PHOTO
========================================================== */

export const updateFeaturedPhoto =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      const photo =
        gallery.featuredPhotos.id(
          req.params.id
        );

      if (!photo) {
        return errorResponse(
          res,
          "Featured photo not found.",
          404
        );
      }

      const {
        title,
        description,
      } = req.body;

      if (
        title !== undefined
      ) {
        photo.title =
          title;
      }

      if (
        description !==
        undefined
      ) {
        photo.description =
          description;
      }

      if (req.file) {

        if (
          photo.publicId
        ) {
          await deleteFromCloudinary(
            photo.publicId,
            "image"
          );
        }

        const result =
          await uploadImageToCloudinary(
            req.file,
            "photo-gallery/featured"
          );

        photo.image =
          result.secure_url;

        photo.publicId =
          result.public_id;

      }

      await gallery.save();

      return successResponse(
        res,
        "Featured photo updated successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to update featured photo."
      );

    }
  };

/* ==========================================================
   DELETE FEATURED PHOTO
========================================================== */

export const deleteFeaturedPhoto =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      const photo =
        gallery.featuredPhotos.id(
          req.params.id
        );

      if (!photo) {
        return errorResponse(
          res,
          "Featured photo not found.",
          404
        );
      }

      if (
        photo.publicId
      ) {
        await deleteFromCloudinary(
          photo.publicId,
          "image"
        );
      }

      photo.deleteOne();

      await gallery.save();

      return successResponse(
        res,
        "Featured photo deleted successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete featured photo."
      );

    }
  };


/* ==========================================================
   ADD YEAR FOLDER
========================================================== */

export const addYearFolder =
  async (
    req,
    res
  ) => {
    try {

      const { year } =
        req.body;

      if (!year?.trim()) {
        return errorResponse(
          res,
          "Year is required.",
          400
        );
      }

      const gallery =
        await ensureGallery();

      const exists =
        gallery.yearFolders.some(
          (folder) =>
            folder.year.trim() ===
            year.trim()
        );

      if (exists) {
        return errorResponse(
          res,
          "Year already exists.",
          400
        );
      }

      gallery.yearFolders.push({
        year:
          year.trim(),
      });

      await gallery.save();

      return successResponse(
        res,
        "Year folder added successfully.",
        gallery,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to add year folder."
      );

    }
  };

/* ==========================================================
   UPDATE YEAR FOLDER
========================================================== */

export const updateYearFolder =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      const folder =
        gallery.yearFolders.id(
          req.params.yearId
        );

      if (!folder) {
        return errorResponse(
          res,
          "Year folder not found.",
          404
        );
      }

      const { year } =
        req.body;

      if (
        year?.trim()
      ) {

        const duplicate =
          gallery.yearFolders.some(
            (item) =>
              item._id.toString() !==
                req.params.yearId &&
              item.year.trim() ===
                year.trim()
          );

        if (duplicate) {
          return errorResponse(
            res,
            "Year already exists.",
            400
          );
        }

        folder.year =
          year.trim();

      }

      await gallery.save();

      return successResponse(
        res,
        "Year folder updated successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to update year folder."
      );

    }
  };

/* ==========================================================
   DELETE YEAR FOLDER
========================================================== */

export const deleteYearFolder =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      const folder =
        gallery.yearFolders.id(
          req.params.yearId
        );

      if (!folder) {
        return errorResponse(
          res,
          "Year folder not found.",
          404
        );
      }

      /* ==========================
         DELETE ALBUMS & PHOTOS
      ========================== */

      for (const album of folder.albums) {

        if (
          album.publicId
        ) {
          await deleteFromCloudinary(
            album.publicId,
            "image"
          );
        }

        for (const photo of album.photos) {

          if (
            photo.publicId
          ) {
            await deleteFromCloudinary(
              photo.publicId,
              "image"
            );
          }

        }

      }

      folder.deleteOne();

      await gallery.save();

      return successResponse(
        res,
        "Year folder deleted successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete year folder."
      );

    }
  };


/* ==========================================================
   ADD ALBUM
========================================================== */

export const addAlbum =
  async (
    req,
    res
  ) => {
    try {

      const {
        yearId,
      } = req.params;

      const {
        title,
        eventDate,
      } = req.body;

      const gallery =
        await ensureGallery();

      const folder =
        gallery.yearFolders.id(
          yearId
        );

      if (!folder) {
        return errorResponse(
          res,
          "Year folder not found.",
          404
        );
      }

      let coverImage = "";
      let publicId = "";

      if (req.file) {

        const result =
          await uploadImageToCloudinary(
            req.file,
            "photo-gallery/albums"
          );

        coverImage =
          result.secure_url;

        publicId =
          result.public_id;

      }

      folder.albums.push({
        title,
        eventDate,
        coverImage,
        publicId,
        photos: [],
      });

      await gallery.save();

      return successResponse(
        res,
        "Album created successfully.",
        gallery,
        201
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to add album."
      );

    }
  };

/* ==========================================================
   UPDATE ALBUM
========================================================== */

export const updateAlbum =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      let album = null;

      for (const year of gallery.yearFolders) {

        const found =
          year.albums.id(
            req.params.albumId
          );

        if (found) {
          album = found;
          break;
        }

      }

      if (!album) {
        return errorResponse(
          res,
          "Album not found.",
          404
        );
      }

      const {
        title,
        eventDate,
      } = req.body;

      if (
        title !== undefined
      ) {
        album.title =
          title;
      }

      if (
        eventDate !==
        undefined
      ) {
        album.eventDate =
          eventDate;
      }

      if (req.file) {

        if (
          album.publicId
        ) {
          await deleteFromCloudinary(
            album.publicId,
            "image"
          );
        }

        const result =
          await uploadImageToCloudinary(
            req.file,
            "photo-gallery/albums"
          );

        album.coverImage =
          result.secure_url;

        album.publicId =
          result.public_id;

      }

      await gallery.save();

      return successResponse(
        res,
        "Album updated successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to update album."
      );

    }
  };

/* ==========================================================
   DELETE ALBUM
========================================================== */

export const deleteAlbum =
  async (
    req,
    res
  ) => {
    try {

      const gallery =
        await ensureGallery();

      let album = null;

      for (const year of gallery.yearFolders) {

        const found =
          year.albums.id(
            req.params.albumId
          );

        if (found) {
          album = found;
          break;
        }

      }

      if (!album) {
        return errorResponse(
          res,
          "Album not found.",
          404
        );
      }

      /* ==========================
         DELETE COVER IMAGE
      ========================== */

      if (
        album.publicId
      ) {
        await deleteFromCloudinary(
          album.publicId,
          "image"
        );
      }

      /* ==========================
         DELETE ALBUM PHOTOS
      ========================== */

      for (const photo of album.photos) {

        if (
          photo.publicId
        ) {
          await deleteFromCloudinary(
            photo.publicId,
            "image"
          );
        }

      }

      album.deleteOne();

      await gallery.save();

      return successResponse(
        res,
        "Album deleted successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete album."
      );

    }
  };


/* ==========================================================
   ADD PHOTOS TO ALBUM
========================================================== */

export const addPhotosToAlbum =
  async (
    req,
    res
  ) => {
    try {

      const {
        albumId,
      } = req.params;

      if (
        !req.files ||
        req.files.length === 0
      ) {
        return errorResponse(
          res,
          "Please upload at least one photo.",
          400
        );
      }

      const gallery =
        await ensureGallery();

      let album = null;

      for (const year of gallery.yearFolders) {

        const found =
          year.albums.id(
            albumId
          );

        if (found) {
          album = found;
          break;
        }

      }

      if (!album) {
        return errorResponse(
          res,
          "Album not found.",
          404
        );
      }

      for (const file of req.files) {

        const result =
          await uploadImageToCloudinary(
            file,
            "photo-gallery/photos"
          );

        album.photos.push({
          image:
            result.secure_url,
          publicId:
            result.public_id,
        });

      }

      await gallery.save();

      return successResponse(
        res,
        "Photos uploaded successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to upload photos."
      );

    }
  };

/* ==========================================================
   DELETE PHOTO FROM ALBUM
========================================================== */

export const deletePhotoFromAlbum =
  async (
    req,
    res
  ) => {
    try {

      const {
        albumId,
        photoId,
      } = req.params;

      const gallery =
        await ensureGallery();

      let album = null;

      for (const year of gallery.yearFolders) {

        const found =
          year.albums.id(
            albumId
          );

        if (found) {
          album = found;
          break;
        }

      }

      if (!album) {
        return errorResponse(
          res,
          "Album not found.",
          404
        );
      }

      const photo =
        album.photos.id(
          photoId
        );

      if (!photo) {
        return errorResponse(
          res,
          "Photo not found.",
          404
        );
      }

      if (
        photo.publicId
      ) {
        await deleteFromCloudinary(
          photo.publicId,
          "image"
        );
      }

      photo.deleteOne();

      await gallery.save();

      return successResponse(
        res,
        "Photo deleted successfully.",
        gallery
      );

    } catch (error) {

      return errorResponse(
        res,
        error.message ||
          "Failed to delete photo."
      );

    }
  };