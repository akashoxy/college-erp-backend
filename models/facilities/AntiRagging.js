import mongoose from "mongoose";

/* ==========================================================
   POSTER SCHEMA
========================================================== */

const posterSchema = new mongoose.Schema(
  {
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

/* ==========================================================
   FEATURE SCHEMA
========================================================== */

const featureSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "",
      trim: true,
    },

    iconPublicId: {
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

/* ==========================================================
   COMMITTEE MEMBER
========================================================== */

const committeeMemberSchema = new mongoose.Schema(
  {
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

    name: {
      type: String,
      default: "",
      trim: true,
    },

    designation: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   MAIN SCHEMA
========================================================== */

const antiRaggingSchema = new mongoose.Schema(
  {
    /* ======================================================
       HERO
    ====================================================== */

    heroSubtitle: {
      type: String,
      default: "",
      trim: true,
    },

    heroBackgroundImage: {
      type: String,
      default: "",
    },

    heroBackgroundImagePublicId: {
      type: String,
      default: "",
    },

    /* ======================================================
       POSTERS
    ====================================================== */

    posters: {
      type: [posterSchema],
      default: [],
    },

    /* ======================================================
       INTRODUCTION
    ====================================================== */

    introductionTitle: {
      type: String,
      default: "",
      trim: true,
    },

    introductionDescription: {
      type: String,
      default: "",
      trim: true,
    },

    /* ======================================================
       FEATURES
    ====================================================== */

    features: {
      type: [featureSchema],
      default: [],
    },

    /* ======================================================
       RULES
    ====================================================== */

    rules: {
      type: [String],
      default: [],
    },

    /* ======================================================
       COMMITTEE
    ====================================================== */

    committeeTitle: {
      type: String,
      default: "",
      trim: true,
    },

    committeeDescription: {
      type: String,
      default: "",
      trim: true,
    },

    committeeMembers: {
      type: [committeeMemberSchema],
      default: [],
    },

    /* ======================================================
       CONTACT
    ====================================================== */

    helplineNumber: {
      type: String,
      default: "",
      trim: true,
    },

    officialEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    reportButtonText: {
      type: String,
      default: "Report Incident",
      trim: true,
    },

    complaintButtonText: {
      type: String,
      default: "Lodge Complaint",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model(
  "AntiRagging",
  antiRaggingSchema
);