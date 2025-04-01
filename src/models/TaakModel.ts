import mongoose, { Schema } from "mongoose";
import { Bijlage } from "./BijlageModel";
import { Vak } from "./VakModel";

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
    },
    isGepubliceerd: {
      type: Boolean,
      required: true,
    },
    vak: {
      type: Schema.Types.ObjectId,
      ref: Vak,
      required: true,
    },
    bijlagen: [
      {
        type: Schema.Types.ObjectId,
        ref: Bijlage,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Taak = mongoose.model("Taak", taakSchema);
