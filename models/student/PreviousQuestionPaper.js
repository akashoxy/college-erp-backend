import mongoose from "mongoose";

const previousQuestionPaperSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      program: {
        type: String,
        enum: ["BCA", "BBA", "MCA"],
        required: true,
        trim: true,
      },

      semester: {
        type: String,
        required: true,
        trim: true,
      },

      subject: {
        type: String,
        required: true,
        trim: true,
      },

      year: {
        type: Number,
        required: true,
        min: 2017,
        max: new Date().getFullYear(),
      },

      paperType: {
        type: String,
        enum: ["New", "Old"],
        default: "New",
        required: true,
      },

      // Cloudinary PDF URL
      pdfFile: {
        type: String,
        required: true,
        trim: true,
      },

      // Cloudinary Public ID
      pdfPublicId: {
        type: String,
        default: "",
        trim: true,
      },

      downloads: {
        type: Number,
        default: 0,
        min: 0,
      },

      description: {
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
  "PreviousQuestionPaper",
  previousQuestionPaperSchema
);