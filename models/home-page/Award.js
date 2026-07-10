import mongoose from "mongoose";

const awardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    recipient: {
      type: String,
      required: true,
      trim: true,
    },

    awardee: {
      type: String,
      required: true,
      trim: true,
    },

    awardDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary Image URL
    image: {
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

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Award",
  awardSchema
);