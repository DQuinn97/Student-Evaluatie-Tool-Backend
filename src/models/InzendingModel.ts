import mongoose, { HydratedDocumentFromSchema, Schema } from "mongoose";
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
    gradering: {
      type: Schema.Types.ObjectId,
      ref: Gradering,
    },
    inzending: {
      type: Date,
      required: true,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
    collection: "inzendingen",
  }
);
export type TInzending = HydratedDocumentFromSchema<typeof inzendingSchema>;
export const Inzending = mongoose.model("Inzending", inzendingSchema);
