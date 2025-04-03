import mongoose, { Schema } from "mongoose";
import { Gebruiker } from "./GebruikerModel";

const graderingSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
    docent: {
      type: Schema.Types.ObjectId,
      ref: Gebruiker,
    },
  },
  {
    timestamps: true,
    collection: "graderingen",
  }
);

export const Gradering = mongoose.model("Gradering", graderingSchema);
