import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
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
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["student"],
      default: "student",
    },

    roll: {
      type: String,
      unique: true,
      sparse: true,
      default: "",
      trim: true,
    },

    reg: {
      type: String,
      unique: true,
      sparse: true,
      default: "",
      trim: true,
    },

    stream: {
      type: String,
      enum: ["BCA", "BBA", "MCA"],
      default: "",
      uppercase: true,
      trim: true,
    },

    semester: {
      type: Number,
      default: 1,
      min: 1,
      max: 8,
    },

    status: {
      type: String,
      enum: [
        "active",
        "passout",
        "suspended",
      ],
      default: "active",
      index: true,
    },

    batch: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================================
   HASH PASSWORD
============================================================================= */

studentSchema.pre(
  "save",
  async function () {
    if (!this.isModified("password")) {
      return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );
  }
);

/* ==========================================================================
   COMPARE PASSWORD
============================================================================= */

studentSchema.methods.comparePassword =
  async function (password) {
    return await bcrypt.compare(
      password,
      this.password
    );
  };

/* ==========================================================================
   EXPORT MODEL
============================================================================= */

const Student =
  mongoose.models.Student ||
  mongoose.model(
    "Student",
    studentSchema
  );

export default Student;