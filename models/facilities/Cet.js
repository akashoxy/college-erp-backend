import mongoose from "mongoose";

const cetSchema = new mongoose.Schema({

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

const Cet = mongoose.model(
  "Cet",
  cetSchema
);

export default Cet;