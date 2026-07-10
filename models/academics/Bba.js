import mongoose from "mongoose";

const bbaSchema = new mongoose.Schema({

 image: {
  type: String,
  default: "",
},

imagePublicId: {
  type: String,
  default: "",
},

  bbaDescription: String,

  objectives: [String],

  valueAddedPrograms: [String],

  jobProspects: [String],

  placementAssistance: String,

  courseDetails: String,

  duration: String,

  eligibility: String,

},
{
    timestamps: true,
  }
);

const Bba = mongoose.model(
  "Bba",
  bbaSchema
);

export default Bba;