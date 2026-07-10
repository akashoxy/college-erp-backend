import mongoose from "mongoose";

/* =========================================
   ALUMNI TALK
========================================= */

const alumniTalkSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      videoUrl: {
        type: String,
        default: "",
        trim: true,
      },

      videoPublicId: {
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
   VIDEO GALLERY
========================================= */

const videoGallerySchema =
  new mongoose.Schema(
    {
      bannerVideo: {
  type: String,
  default: "",
},

bannerVideoPublicId: {
  type: String,
  default: "",
},

promoVideo: {
  type: String,
  default: "",
},

promoVideoPublicId: {
  type: String,
  default: "",
},

      paragraph: {
        type: String,
        default: "",
        trim: true,
      },

      alumniTalks: {
        type: [alumniTalkSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "VideoGallery",
  videoGallerySchema
);