import mongoose from "mongoose";

const facultyNoteSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true,
    },

    facultyName: {
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

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary PDF URL
    pdfFile: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary Public ID
    pdfPublicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================================
   INDEXES
============================================================================= */

facultyNoteSchema.index({
  uploadedBy: 1,
  createdAt: -1,
});

facultyNoteSchema.index({
  program: 1,
  semester: 1,
});

facultyNoteSchema.index({
  subject: 1,
});

export default mongoose.model(
  "FacultyNote",
  facultyNoteSchema
);