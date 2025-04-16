import mongoose, { HydratedDocumentFromSchema, Schema } from "mongoose";
import { Gebruiker } from "./GebruikerModel";

const graderingSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
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
export type TGradering = HydratedDocumentFromSchema<typeof graderingSchema>;
export const Gradering = mongoose.model("Gradering", graderingSchema);
