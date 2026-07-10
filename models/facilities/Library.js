import mongoose from "mongoose";

/* ==================================================
   EBOOK SCHEMA
================================================== */

const ebookSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "",
        trim: true,
    },

    author: {
        type: String,
        default: "",
        trim: true,
    },

    category: {
        type: String,
        default: "",
        trim: true,
    },

    pdfFile: {
        type: String,
        default: "",
    },

    pdfPublicId: {
        type: String,
        default: "",
    },
});

/* ==================================================
   LIBRARIAN SCHEMA
================================================== */

const librarianSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      default: "",
    },

    avatarPublicId: {
      type: String,
      default: "",
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

    qualification: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

/* ==================================================
   LIBRARY SCHEMA
================================================== */

const librarySchema = new mongoose.Schema(
  {
    /* ==========================================
       ABOUT LIBRARY
    ========================================== */

    title: {
      type: String,
      default: "",
      trim: true,
    },

    paragraph: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================
       ONLINE LIBRARY
    ========================================== */

    onlineLibrary: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================
       READING ROOM
    ========================================== */

    readingRoom: {
      type: String,
      default: "",
      trim: true,
    },

    /* ==========================================
       SIDE IMAGE
    ========================================== */

    sideImage: {
      type: String,
      default: "",
    },

    sideImagePublicId: {
      type: String,
      default: "",
    },

    /* ==========================================
       LIBRARIANS
    ========================================== */

    librarians: {
      type: [librarianSchema],
      default: [],
    },

    /* ==========================================
       EBOOKS
    ========================================== */

    ebooks: {
      type: [ebookSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/* ==================================================
   INDEXES
================================================== */

librarySchema.index({
  createdAt: -1,
});

export default mongoose.model(
  "Library",
  librarySchema
);