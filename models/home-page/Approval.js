import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary Image URL
    logo: {
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

    websiteLink: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Approval",
  approvalSchema
);