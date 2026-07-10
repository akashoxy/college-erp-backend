import mongoose from "mongoose";

const recruiterSchema =
  new mongoose.Schema(
    {
      companyName: {
        type: String,
        required: true,
        trim: true,
      },

      website: {
        type: String,
        default: "",
        trim: true,
      },

      logo: {
        type: String,
        default: "",
        trim: true,
      },

      logoPublicId: {
        type: String,
        default: "",
        trim: true,
      },

      active: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Recruiter",
  recruiterSchema
);