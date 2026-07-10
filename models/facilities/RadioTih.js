import mongoose from "mongoose";

const radioTihSchema = new mongoose.Schema(
  {
    bannerVideo: {
      type: String,
      default: "",
      trim: true,
    },

    programList: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "RadioTih",
  radioTihSchema
);