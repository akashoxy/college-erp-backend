import mongoose from "mongoose";

const semesterFeeSchema = new mongoose.Schema(
  {
    semester: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const feeStructureSchema = new mongoose.Schema(
  {
    stream: {
      type: String,
      required: true,
      trim: true,
      enum: ["BCA", "BBA", "MCA"],
      unique: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    semesterFees: {
      type: [semesterFeeSchema],
      default: [],
    },

    totalFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    batch: {
      type: String,
      default: "",
      trim: true,
    },

    pdfFile: {
      type: String,
      default: "",
      trim: true,
    },

    pdfPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "FeeStructure",
  feeStructureSchema
);