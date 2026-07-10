import mongoose from "mongoose";

const whyParticipateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const sparkQuestFestSchema = new mongoose.Schema(
  {
    /* ==========================
       HERO SECTION
    ========================== */

    heroSubtitle: {
      type: String,
      default: "Annual Technical Fest",
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

    /* ==========================
       EVENT DETAILS
    ========================== */

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    eventVenue: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================
       REGISTRATION
    ========================== */

    registerLink: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================
       ABOUT
    ========================== */

    about: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================
       WHY PARTICIPATE
    ========================== */

    whyParticipate: {
      type: [whyParticipateSchema],
      default: [],
    },

    /* ==========================
       EVENT ATTRACTIONS
    ========================== */

    hackathons: {
      type: String,
      default: "",
      trim: true,
    },

    roboticsDrones: {
      type: String,
      default: "",
      trim: true,
    },

    gamingArena: {
      type: String,
      default: "",
      trim: true,
    },

    techTalks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SparkQuestFest = mongoose.model(
  "SparkQuestFest",
  sparkQuestFestSchema
);

export default SparkQuestFest;