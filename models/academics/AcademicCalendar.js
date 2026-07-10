import mongoose from "mongoose";

const academicCalendarSchema = new mongoose.Schema(
  {
    fileUrl: {
  type: String,
  default: null,
},

publicId: {
  type: String,
  default: null,
},

fileType: {
  type: String,
  enum: ["image", "pdf"],
  default: null,
},

    redirectUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AcademicCalendar = mongoose.model(
  "AcademicCalendar",
  academicCalendarSchema
);

export default AcademicCalendar;