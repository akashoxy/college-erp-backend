import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    designation: {
      type: String,
      default: "",
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    photo: {
      type: String,
      default: "",
      trim: true,
    },

    photoPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["faculty"],
      default: "faculty",
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================================
   HASH PASSWORD
============================================================================= */

facultySchema.pre(
  "save",
  async function () {
    if (!this.isModified("password")) {
      return;
    }

    const salt =
      await bcrypt.genSalt(10);

    this.password =
      await bcrypt.hash(
        this.password,
        salt
      );
  }
);

/* ==========================================================================
   EXPORT MODEL
============================================================================= */

const Faculty =
  mongoose.models.Faculty ||
  mongoose.model(
    "Faculty",
    facultySchema
  );

export default Faculty;