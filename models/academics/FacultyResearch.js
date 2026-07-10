import mongoose from "mongoose";

const facultyResearchSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["faculty", "lab", "library"],
      required: true,
      default: "faculty",
    },

   photo: {
  type: String,
  default: "",
},

publicId: {
  type: String,
  default: "",
},

    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    researchInterests: [
      {
        type: String,
      },
    ],

    publications: [
      {
        type: String,
      },
    ],

    scholarLink: {
      type: String,
      default: "",
    },

    orcidLink: {
      type: String,
      default: "",
    },

    linkedinLink: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "FacultyResearch",
  facultyResearchSchema
);