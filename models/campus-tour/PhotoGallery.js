import mongoose from "mongoose";

/* ==================================================
   PHOTO
================================================== */

const photoSchema =
  new mongoose.Schema(
    {
      image: {
        type: String,
        required: true,
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },

      caption: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: true,
    }
  );

/* ==================================================
   ALBUM
================================================== */

const albumSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      coverImage: {
        type: String,
        default: "",
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },

      eventDate: {
        type: Date,
      },

      photos: {
        type: [photoSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

/* ==================================================
   YEAR FOLDER
================================================== */

const yearFolderSchema =
  new mongoose.Schema(
    {
      year: {
        type: String,
        required: true,
        trim: true,
      },

      albums: {
        type: [albumSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

/* ==================================================
   FEATURED PHOTO
================================================== */

const featuredPhotoSchema =
  new mongoose.Schema(
    {
      image: {
        type: String,
        required: true,
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

/* ==================================================
   HERO IMAGE
================================================== */

const heroImageSchema =
  new mongoose.Schema(
    {
      image: {
        type: String,
        required: true,
        trim: true,
      },

      publicId: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

/* ==================================================
   MAIN SCHEMA
================================================== */

const photoGallerySchema =
  new mongoose.Schema(
    {
      heroImages: {
        type: [heroImageSchema],
        default: [],
      },

      featuredPhotos: {
        type: [featuredPhotoSchema],
        default: [],
      },

      yearFolders: {
        type: [yearFolderSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "PhotoGallery",
  photoGallerySchema
);