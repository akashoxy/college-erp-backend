import mongoose from "mongoose";

const laboratoryUnitSchema = new mongoose.Schema(
  {
    labImage: {
      type: String,
      default: "",
    },

    labImagePublicId: {
      type: String,
      default: "",
    },

    labName: {
      type: String,
      trim: true,
      default: "",
    },

    labTeacher: {
      type: String,
      trim: true,
      default: "",
    },

    designation: {
      type: String,
      trim: true,
      default: "",
    },

    qualification: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const computerLabSchema = new mongoose.Schema(
  {
    // ==================================
    // HERO SECTION
    // ==================================

    bannerImage: {
      type: String,
      default: "",
    },

    bannerImagePublicId: {
      type: String,
      default: "",
    },

    paragraph: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================
    // FACILITIES
    // ==================================

    facilities: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==================================
    // SIDE IMAGE
    // ==================================

    sideImage: {
      type: String,
      default: "",
    },

    sideImagePublicId: {
      type: String,
      default: "",
    },

    // ==================================
    // LABORATORY UNITS
    // ==================================

    laboratoryUnits: {
      type: [laboratoryUnitSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ComputerLaboratory = mongoose.model(
  "ComputerLaboratory",
  computerLabSchema
);

export default ComputerLaboratory;