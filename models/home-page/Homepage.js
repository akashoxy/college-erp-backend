import mongoose from "mongoose";

const slideSchema = new mongoose.Schema(
  {
    // Cloudinary URL
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

    fileType: {
      type: String,
      enum: ["image", "pdf"],
      default: "image",
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    buttonText: {
      type: String,
      default: "",
      trim: true,
    },

    buttonLink: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const homepageSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      default: "",
      trim: true,
    },

    slides: {
      type: [slideSchema],
      default: [],
    },

    admissionText: {
      type: String,
      default: "Admissions Open",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Homepage =
  mongoose.models.Homepage ||
  mongoose.model(
    "Homepage",
    homepageSchema
  );

export default Homepage;