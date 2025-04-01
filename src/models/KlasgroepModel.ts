import mongoose, { Schema } from "mongoose";
import { Gebruiker } from "./GebruikerModel";
import { Vak } from "./VakModel";

//@ts-ignore zegt dat gebruiker circulair is met klasgroep, maar dient ander doel
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
  }
);
//@ts-ignore zegt dat gebruiker circulair is met klasgroep, maar dient ander doel
export const Klasgroep = mongoose.model("Klasgroep", klasgroepSchema);
