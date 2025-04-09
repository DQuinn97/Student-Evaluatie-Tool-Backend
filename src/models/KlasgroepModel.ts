import mongoose, { HydratedDocumentFromSchema, Schema } from "mongoose";
import { Gebruiker } from "./GebruikerModel";
import { Vak } from "./VakModel";

const klasgroepSchema = new mongoose.Schema(
  {
    naam: {
      type: String,
      required: true,
      trim: true,
    },
    beginjaar: {
      type: Number,
      required: true,
      default: false,
    },
    eindjaar: {
      type: Number,
      required: true,
      default: false,
    },
    studenten: [
      {
        type: Schema.Types.ObjectId,
        ref: Gebruiker,
      },
    ],
    vakken: [
      {
        type: Schema.Types.ObjectId,
        ref: Vak,
      },
    ],
  },
  {
    timestamps: true,
    collection: "klasgroepen",
  }
);
export type TKlasgroep = HydratedDocumentFromSchema<typeof klasgroepSchema>;
export const Klasgroep = mongoose.model("Klasgroep", klasgroepSchema);
