import mongoose, { HydratedDocumentFromSchema, Schema } from "mongoose";
import { Gebruiker } from "./GebruikerModel";

const bijlageSchema = new mongoose.Schema(
  {
    URL: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    gebruiker: {
      type: Schema.Types.ObjectId,
      ref: Gebruiker,
    },
  },
  {
    timestamps: true,
    collection: "bijlagen",
  }
);
export type TBijlage = HydratedDocumentFromSchema<typeof bijlageSchema>;

export const Bijlage = mongoose.model("Bijlage", bijlageSchema);
