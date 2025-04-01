import mongoose from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

export const Gebruiker = mongoose.model("Gebruiker", gebruikerSchema);
