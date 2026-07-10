import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "AcademicCapIcon",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const visionMissionSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: "Vision & Mission",
      trim: true,
    },

    heroDescription: {
      type: String,
      default:
        "Guiding principles that shape our academic excellence, innovation, and commitment to society.",
      trim: true,
    },

    visionTitle: {
      type: String,
      default: "Our Vision",
      trim: true,
    },

    visionDescription: {
      type: String,
      default: "",
      trim: true,
    },

    missions: {
      type: [missionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "VisionMission",
  visionMissionSchema
);