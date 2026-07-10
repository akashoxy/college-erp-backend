import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true,
    },

    stream: {
      type: String,
      required: true,
      enum: ["BCA", "BBA", "MCA"],
      trim: true,
      index: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    session: {
      type: String,
      required: true,
      trim: true,
    },

    attendance: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        status: {
          type: String,
          enum: ["Present", "Absent"],
          default: "Present",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* ==========================================================================
   PREVENT DUPLICATE ATTENDANCE
============================================================================= */

attendanceSchema.index(
  {
    date: 1,
    subjectId: 1,
    facultyId: 1,
  },
  {
    unique: true,
  }
);

/* ==========================================================================
   REPORT INDEXES
============================================================================= */

attendanceSchema.index({
  stream: 1,
  semester: 1,
});

attendanceSchema.index({
  subjectId: 1,
  date: -1,
});

attendanceSchema.index({
  facultyId: 1,
  date: -1,
});

export default mongoose.model(
  "Attendance",
  attendanceSchema
);