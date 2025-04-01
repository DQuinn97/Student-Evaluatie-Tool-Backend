import mongoose from "mongoose";

const stageverslagSchema = new mongoose.Schema(
  {
    datum: {
      type: Date,
      required: true,
      trim: true,
    },
    stagebedrijf: {
      type: String,
      trim: true,
    },
    uitvoering: {
      type: String,
      trim: true,
    },
    ervaring: {
      type: String,
      trim: true,
    },
    bijgeleerd: {
      type: String,
      trim: true,
    },
    conclusie: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      trim: true,
    },
    reflectie: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Stageverslag = mongoose.model("Stageverslag", stageverslagSchema);
