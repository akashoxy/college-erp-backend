import mongoose from "mongoose";

const admissionProcedureSchema =
  new mongoose.Schema(
    {
      code: {
        type: String,
        required: true,
      },

      duration: {
        type: String,
        required: true,
      },

      details: {
        type: String,
        required: true,
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

const AdmissionProcedure =
  mongoose.model(
    "AdmissionProcedure",
    admissionProcedureSchema
  );

export default AdmissionProcedure;