import mongoose from "mongoose";

const syllabusSchema = new mongoose.Schema(
  {
    stream: {
      type: String,
      enum: ["MCA", "BCA", "BBA"],
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    syllabusType: {
      type: String,
      enum: ["new", "old"],
      required: true,
      trim: true,
    },

    // Cloudinary PDF URL
    pdfFile: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary Public ID
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

/* ==========================================================================
   PREVENT DUPLICATE SYLLABUS
============================================================================= */

syllabusSchema.index(
  {
    stream: 1,
    semester: 1,
    syllabusType: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "Syllabus",
  syllabusSchema
);