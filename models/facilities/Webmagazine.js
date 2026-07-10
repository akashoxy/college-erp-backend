import mongoose from "mongoose";

const webmagazineSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    author: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Annual Magazine",
        "Technical Journal",
        "Research Journal",
        "Newsletter",
        "Department Magazine",
        "Event Magazine",
        "Student Publication",
      ],
      default: "Annual Magazine",
    },

    edition: {
      type: String,
      default: "",
      trim: true,
    },

    publicationDate: {
      type: Date,
      default: null,
    },

    year: {
      type: Number,
      default: new Date().getFullYear(),
    },

    pdfFile: {
      type: String,
      default: "",
    },

    pdfPublicId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "WebMagazine",
  webmagazineSchema
);