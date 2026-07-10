import mongoose from "mongoose";


/* ==================================================
   SPORTS EVENT
================================================== */

const sportsEventSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
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
      timestamps: true,
    }
  );

/* ==================================================
   ACHIEVEMENT
================================================== */

const achievementSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
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
      timestamps: true,
    }
  );



/* ==================================================
   TIMELINE
================================================== */

const timelineSchema =
  new mongoose.Schema(
    {
      day: {
        type: String,
        required: true,
        trim: true,
      },

      title: {
        type: String,
        required: true,
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

/* ==================================================
   HIGHLIGHTS
================================================== */

const highlightSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      icon: {
        type: String,
        default: "🏆",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/* ==================================================
   MAIN SCHEMA
================================================== */

const annualSportsMeetSchema =
  new mongoose.Schema(
    {
      heroSubtitle: {
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

      aboutText: {
        type: String,
        default: "",
        trim: true,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
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


      sportsEvents: {
        type: [sportsEventSchema],
        default: [],
      },

      achievements: {
        type: [achievementSchema],
        default: [],
      },

      timeline: {
        type: [timelineSchema],
        default: [],
      },

      highlights: {
        type: [highlightSchema],
        default: [],
      },

      ctaTitle: {
        type: String,
        default: "",
        trim: true,
      },

      ctaDescription: {
        type: String,
        default: "",
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

export default mongoose.model(
  "AnnualSportsMeet",
  annualSportsMeetSchema
);