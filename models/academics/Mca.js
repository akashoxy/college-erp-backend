import mongoose from "mongoose";

const mcaSchema = new mongoose.Schema({

  image: {
  type: String,
  default: "",
},

imagePublicId: {
  type: String,
  default: "",
},

  mcaDescription: String,

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

const Mca = mongoose.model(
  "Mca",
  mcaSchema
);

export default Mca;