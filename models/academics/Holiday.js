import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },

    day: {
      type: String,
      required: true,
      trim: true,
    },

    particular: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;