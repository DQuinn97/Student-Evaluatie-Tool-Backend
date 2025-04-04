import mongoose, { Schema } from "mongoose";
import { HydratedDocumentFromSchema } from "mongoose";

const gebruikerSchema = new mongoose.Schema(
  {
    naam: {
      type: String,
      nullable: true,
      trim: true,
    },
    achternaam: {
      type: String,
      nullable: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    wachtwoord: {
      type: String,
      required: true,
      trim: true,
    },
    gsm: {
      type: String,
      nullable: true,
      trim: true,
    },
    isDocent: {
      type: Boolean,
      default: false,
    },
    foto: {
      type: String,
      nullable: true,
      trim: true,
    },
    resetToken: {
      type: String,
      nullable: true,
    },
  },
  {
    timestamps: true,
    collection: "gebruikers",
  }
);
export type TGebruiker = HydratedDocumentFromSchema<typeof gebruikerSchema>;

export const Gebruiker = mongoose.model("Gebruiker", gebruikerSchema);
