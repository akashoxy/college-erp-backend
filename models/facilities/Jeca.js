import mongoose from "mongoose";

const jecaSchema =
  new mongoose.Schema({

    paragraph: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },
    bannerImagePublicId: {
  type: String,
  default: "",
},

  });

const Jeca = mongoose.model(
  "Jeca",
  jecaSchema
);

export default Jeca;