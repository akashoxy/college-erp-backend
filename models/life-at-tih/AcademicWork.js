import mongoose from "mongoose";

/* =========================================
   GALLERY IMAGE
========================================= */

const galleryImageSchema =
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
      _id: false,
    }
  );

/* =========================================
   MAIN SCHEMA
========================================= */

const academicWorkSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      category: {
        type: String,
        required: true,
        enum: [
          "Industrial Visit",
          "Workshop",
          "Faculty Development Program",
          "Seminar",
          "Internship",
          "Research Activity",
          "Guest Lecture",
          "Hackathon",
          "Training Program",
        ],
        trim: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      activityDate: {
        type: Date,
        required: true,
      },

      organizer: {
        type: String,
        default: "",
        trim: true,
      },

      location: {
        type: String,
        default: "",
        trim: true,
      },

      participants: {
        type: Number,
        default: 0,
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },

      imagePublicId: {
        type: String,
        default: "",
        trim: true,
      },

      gallery: {
        type: [galleryImageSchema],
        default: [],
      },

      featured: {
        type: Boolean,
        default: false,
      },

      status: {
        type: String,
        enum: [
          "Published",
          "Draft",
        ],
        default: "Published",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "AcademicWork",
  academicWorkSchema
);