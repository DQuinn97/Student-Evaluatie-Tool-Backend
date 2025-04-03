import mongoose, { Schema } from "mongoose";
import { Bijlage } from "./BijlageModel";
import { Gradering } from "./GraderingModel";
import { Gebruiker } from "./GebruikerModel";
import { Taak } from "./TaakModel";

const inzendingSchema = new mongoose.Schema(
  {
    git: {
      type: String,
      required: true,
      trim: true,
    },
    live: {
      type: String,
      required: true,
      trim: true,
    },
    beschrijving: {
      type: String,
      required: true,
      trim: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: Gebruiker,
      required: true,
    },

    bijlagen: [
      {
        type: Schema.Types.ObjectId,
        ref: Bijlage,
        trim: true,
      },
    ],
    gradering: [
      {
        type: Schema.Types.ObjectId,
        ref: Gradering,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Inzending = mongoose.model("Inzending", inzendingSchema);
