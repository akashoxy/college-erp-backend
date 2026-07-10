import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
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

    category: {
      type: String,
      required: true,
      trim: true,
    },

    audience: {
      type: String,
      enum: ["student", "faculty"],
      required: true,
    },

    // Cloudinary PDF URL
    pdfFile: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary Public ID
    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    noticeDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Notice",
  noticeSchema
);