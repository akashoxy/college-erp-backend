import mongoose from "mongoose";

const publicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },

    authors: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    pdfPublicId: {
      type: String,
      default: "",
    },

    websiteUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const journalSchema = new mongoose.Schema(
  {
    bannerImage: {
      type: String,
      default: "",
    },

    bannerImagePublicId: {
      type: String,
      default: "",
    },

    paragraph: {
      type: String,
      default: "",
    },

    journalList: {
      type: [String],
      default: [],
    },

    sideImage: {
      type: String,
      default: "",
    },

    sideImagePublicId: {
      type: String,
      default: "",
    },

    researchPublications: {
      type: [publicationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Journal", journalSchema);