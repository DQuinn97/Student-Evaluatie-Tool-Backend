import mongoose, { Schema } from "mongoose";
import { Klasgroep } from "./KlasgroepModel";
import { Bijlage } from "./BijlageModel";

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
    tel: {
      type: String,
      nullable: true,
      trim: true,
    },
    isDocent: {
      type: Boolean,
      default: false,
    },
    actieveKlas: {
      type: Schema.Types.ObjectId,
      ref: Klasgroep,
      nullable: true,
    },
    foto: {
      type: Schema.Types.ObjectId,
      ref: Bijlage,
      nullable: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Gebruiker = mongoose.model("Gebruiker", gebruikerSchema);
