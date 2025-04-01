import mongoose, { Schema } from "mongoose";
import { Bijlage } from "./BijlageModel";

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

export const Inzending = mongoose.model("Inzending", inzendingSchema);
