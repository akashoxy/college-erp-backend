import mongoose from "mongoose";

const programSchema =
  new mongoose.Schema({

    title: String,

    subtitle: String,

    description: String,

    image: String,

  });

const Program = mongoose.model(
  "Program",
  programSchema
);

export default Program;