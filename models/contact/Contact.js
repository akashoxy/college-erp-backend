import mongoose from "mongoose";

const contactSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      queryType: {
        type: String,
        required: true,
        enum: [
          "Admission Query",
          "Academic Query",
          "Business Query",
          "Feedback",
          "Other",
        ],
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Resolved",
        ],
        default: "Pending",
      },
      assignedTo: {
  type: String,
  default: "",
  trim: true,
},

remarks: {
  type: String,
  default: "",
  trim: true,
},

resolvedAt: {
  type: Date,
},

priority: {
  type: String,
  enum: ["Low", "Medium", "High"],
  default: "Medium",
},
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Contact",
  contactSchema
);