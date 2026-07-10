import mongoose from "mongoose";

const bcaSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    bcaDescription: {
      type: String,
      default: "",
    },

    objectives: {
      type: [String],
      default: [],
    },

    valueAddedPrograms: {
      type: [String],
      default: [],
    },

    jobProspects: {
      type: [String],
      default: [],
    },

    placementAssistance: {
      type: String,
      default: "",
    },

    courseDetails: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    eligibility: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Bca = mongoose.model("Bca", bcaSchema);

export default Bca;