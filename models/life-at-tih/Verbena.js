import mongoose from "mongoose";

/* =========================================
   HIGHLIGHT
========================================= */

const highlightSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
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
      _id: false,
    }
  );

/* =========================================
   EVENT CATEGORY
========================================= */

const categorySchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
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
      _id: false,
    }
  );

/* =========================================
   TIMELINE
========================================= */

const timelineSchema =
  new mongoose.Schema(
    {
      day: {
        type: String,
        default: "",
        trim: true,
      },

      title: {
        type: String,
        default: "",
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/* =========================================
   MAIN SCHEMA
========================================= */

const verbenaSchema =
  new mongoose.Schema(
    {

      heroSubtitle: {
        type: String,
        default:
          "Where Culture Meets Creativity",
        trim: true,
      },

      startDate: {
        type: String,
        default: "",
        trim: true,
      },

      endDate: {
        type: String,
        default: "",
        trim: true,
      },

      venue: {
        type: String,
        default: "",
        trim: true,
      },

      registerLink: {
        type: String,
        default: "",
        trim: true,
      },

      heroImage: {
        type: String,
        default: "",
        trim: true,
      },

      heroImagePublicId: {
        type: String,
        default: "",
        trim: true,
      },

      aboutTitle: {
        type: String,
        default: "About Verbena",
        trim: true,
      },

      aboutDescription: {
        type: String,
        default: "",
        trim: true,
      },

      aboutImage: {
        type: String,
        default: "",
        trim: true,
      },

      aboutImagePublicId: {
        type: String,
        default: "",
        trim: true,
      },

      eventCategories: {
        type: [categorySchema],
        default: [],
      },

      whyParticipate: {
        type: [highlightSchema],
        default: [],
      },

      timeline: {
        type: [timelineSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Verbena",
  verbenaSchema
);