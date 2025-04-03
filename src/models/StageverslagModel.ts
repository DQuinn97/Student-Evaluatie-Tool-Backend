import mongoose, { Schema } from "mongoose";
import { Bijlage } from "./BijlageModel";

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
    bijlagen: [
      {
        type: Schema.Types.ObjectId,
        ref: Bijlage,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: "stageverslagen",
  }
);

export const Stageverslag = mongoose.model("Stageverslag", stageverslagSchema);
