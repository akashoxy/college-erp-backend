import mongoose from "mongoose";

/* =========================================================
   GAME SCHEMA
========================================================= */
const gameSchema = new mongoose.Schema(
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
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   COMMON ROOM SCHEMA
========================================================= */
const commonRoomSchema = new mongoose.Schema(
  {
    heroSubtitle: {
      type: String,
      default: "Relax • Refresh • Reconnect",
      trim: true,
    },

    heroImage: {
      type: String,
      default: "",
    },

    heroImagePublicId: {
      type: String,
      default: "",
    },

    aboutText: {
      type: String,
      default: "",
      trim: true,
    },

    games: [gameSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "CommonRoom",
  commonRoomSchema
);