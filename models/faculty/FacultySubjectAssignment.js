import mongoose from "mongoose";

const facultySubjectAssignmentSchema =
  new mongoose.Schema(
    {
      facultyId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true,
        index: true,
      },

      subjectId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        index: true,
      },

      assignedBy: {
        type: String,
        default: "Admin",
        trim: true,
      },

      assignedDate: {
        type: Date,
        default: Date.now,
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

/* ==========================================================================
   PREVENT DUPLICATE ACTIVE ASSIGNMENTS
============================================================================= */

facultySubjectAssignmentSchema.index(
  {
    facultyId: 1,
    subjectId: 1,
    isActive: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
    },
  }
);

export default mongoose.model(
  "FacultySubjectAssignment",
  facultySubjectAssignmentSchema
);