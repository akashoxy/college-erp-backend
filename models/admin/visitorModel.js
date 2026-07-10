import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Visitor", visitorSchema);