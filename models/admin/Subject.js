import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    stream: {
      type: String,
      required: true,
      enum: ["BCA", "BBA", "MCA"],
      trim: true,
      uppercase: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
    },

    session: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================================
   PREVENT DUPLICATE SUBJECTS
============================================================================= */

subjectSchema.index(
  {
    subjectCode: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

/* ==========================================================================
   SEARCH INDEXES
============================================================================= */

subjectSchema.index({
  stream: 1,
  semester: 1,
  isActive: 1,
});

subjectSchema.index({
  subjectName: 1,
});

export default mongoose.model(
  "Subject",
  subjectSchema
);