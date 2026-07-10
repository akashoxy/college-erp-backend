import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Contacted", "Converted"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Admission = mongoose.model(
  "Admission",
  admissionSchema
);

export default Admission;