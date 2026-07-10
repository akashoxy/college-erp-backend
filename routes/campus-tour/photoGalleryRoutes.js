import express from "express";

import {
  getPhotoGallery,
  deleteAllPhotoGalleryData,
  uploadHeroImage,
  deleteHeroImage,
  addFeaturedPhoto,
  updateFeaturedPhoto,
  deleteFeaturedPhoto,
  addYearFolder,
  updateYearFolder,
  deleteYearFolder,
  addAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  deletePhotoFromAlbum,
} from "../../controllers/campus-tour/photoGalleryController.js";

import authMiddleware from "../../middleware/auth/authMiddleware.js";
import { authorizeRoles } from "../../middleware/auth/roleMiddleware.js";

import uploadImage from "../../middleware/bridge/uploadImage.js";

const router = express.Router();

/* ==========================================================
   UPLOAD CONFIGURATION
========================================================== */

const singleImage =
  uploadImage.single("image");

const coverImage =
  uploadImage.single("coverImage");

const albumPhotos =
  uploadImage.array(
    "photos",
    100
  );

/* ==========================================================
   PUBLIC ROUTES
========================================================== */

// Get Photo Gallery
router.get(
  "/",
  getPhotoGallery
);

/* ==========================================================
   ADMIN AUTHENTICATION
========================================================== */

router.use(
  authMiddleware,
  authorizeRoles("admin")
);

/* ==========================================================
   DELETE ALL
========================================================== */

router.delete(
  "/all",
  deleteAllPhotoGalleryData
);

/* ==========================================================
   HERO IMAGES
========================================================== */

router.post(
  "/hero",
  singleImage,
  uploadHeroImage
);

router.delete(
  "/hero/:index",
  deleteHeroImage
);

/* ==========================================================
   FEATURED PHOTOS
========================================================== */

router.post(
  "/featured",
  singleImage,
  addFeaturedPhoto
);

router.put(
  "/featured/:id",
  singleImage,
  updateFeaturedPhoto
);

router.delete(
  "/featured/:id",
  deleteFeaturedPhoto
);

/* ==========================================================
   YEAR FOLDERS
========================================================== */

router.post(
  "/year",
  addYearFolder
);

router.put(
  "/year/:yearId",
  updateYearFolder
);

router.delete(
  "/year/:yearId",
  deleteYearFolder
);

/* ==========================================================
   ALBUMS
========================================================== */

router.post(
  "/year/:yearId/albums",
  coverImage,
  addAlbum
);

router.put(
  "/albums/:albumId",
  coverImage,
  updateAlbum
);

router.delete(
  "/albums/:albumId",
  deleteAlbum
);

/* ==========================================================
   ALBUM PHOTOS
========================================================== */

router.post(
  "/albums/:albumId/photos",
  albumPhotos,
  addPhotosToAlbum
);

router.delete(
  "/albums/:albumId/photos/:photoId",
  deletePhotoFromAlbum
);

export default router;