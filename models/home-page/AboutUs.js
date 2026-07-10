import mongoose from "mongoose";

const aboutUsSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "",
      trim: true,
    },

    heroDescription: {
      type: String,
      default: "",
      trim: true,
    },

    // Campus Image
    campusImage: {
      type: String,
      default: "",
      trim: true,
    },

    campusImagePublicId: {
      type: String,
      default: "",
      trim: true,
    },

    campusTitle: {
      type: String,
      default: "",
      trim: true,
    },

    campusDescription1: {
      type: String,
      default: "",
      trim: true,
    },

    campusDescription2: {
      type: String,
      default: "",
      trim: true,
    },

    // Vision
    visionTitle: {
      type: String,
      default: "",
      trim: true,
    },

    visionDescription1: {
      type: String,
      default: "",
      trim: true,
    },

    visionDescription2: {
      type: String,
      default: "",
      trim: true,
    },

    // Principal Image
    principalImage: {
      type: String,
      default: "",
      trim: true,
    },

    principalImagePublicId: {
      type: String,
      default: "",
      trim: true,
    },

    principalName: {
      type: String,
      default: "",
      trim: true,
    },

    principalDesignation: {
      type: String,
      default: "",
      trim: true,
    },

    principalQuote: {
      type: String,
      default: "",
      trim: true,
    },

    principalMessage: {
      type: String,
      default: "",
      trim: true,
    },

    closingMessage: {
      type: String,
      default: "",
      trim: true,
    },

    yearsOfExcellence: {
      type: String,
      default: "",
      trim: true,
    },

    studentsEducated: {
      type: String,
      default: "",
      trim: true,
    },

    facultyMembers: {
      type: String,
      default: "",
      trim: true,
    },

    placementSupport: {
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
  "AboutUs",
  aboutUsSchema
);