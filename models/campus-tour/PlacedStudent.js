import mongoose from "mongoose";

const placedStudentSchema =
  new mongoose.Schema(
    {
      studentName: {
        type: String,
        required: true,
        trim: true,
      },

      department: {
        type: String,
        required: true,
        trim: true,
      },

      company: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        required: true,
        trim: true,
      },

      package: {
        type: String,
        required: true,
        trim: true,
      },

      placementYear: {
        type: Number,
        required: true,
        min: 2000,
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },

      imagePublicId: {
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
  "PlacedStudent",
  placedStudentSchema
);