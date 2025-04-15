import mongoose, { Schema } from "mongoose";
import { Bijlage } from "./BijlageModel";
import { Vak } from "./VakModel";
import { Inzending } from "./InzendingModel";
import { Klasgroep } from "./KlasgroepModel";
import { HydratedDocumentFromSchema } from "mongoose";

const taakSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["taak", "test"],
      default: "taak",
    },
    titel: {
      type: String,
      required: true,
      trim: true,
    },
    beschrijving: {
      type: String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    weging: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    isGepubliceerd: {
      type: Boolean,
      required: true,
    },
    vak: {
      type: Schema.Types.ObjectId,
      ref: Vak,
      nullable: true,
    },
    klasgroep: {
      type: Schema.Types.ObjectId,
      ref: Klasgroep,
      required: true,
    },
    bijlagen: [
      {
        type: Schema.Types.ObjectId,
        ref: Bijlage,
        trim: true,
      },
    ],
    inzendingen: [
      {
        type: Schema.Types.ObjectId,
        ref: Inzending,
      },
    ],
  },
  {
    timestamps: true,
    collection: "taken",
  }
);
export type TTaak = HydratedDocumentFromSchema<typeof taakSchema>;
export const Taak = mongoose.model("Taak", taakSchema);
