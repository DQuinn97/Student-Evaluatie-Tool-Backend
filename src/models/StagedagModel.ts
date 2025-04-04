import mongoose, { HydratedDocumentFromSchema, Schema } from "mongoose";
import { Bijlage } from "./BijlageModel";

const stagedagSchema = new mongoose.Schema(
  {
    datum: {
      type: Date,
      required: true,
      trim: true,
    },
    voormiddag: {
      type: String,
      trim: true,
    },
    namiddag: {
      type: String,
      trim: true,
    },
    tools: {
      type: String,
      trim: true,
    },
    resultaat: {
      type: String,
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
    collection: "stagedagen",
  }
);
export type TStagedag = HydratedDocumentFromSchema<typeof stagedagSchema>;
export const Stagedag = mongoose.model("Stagedag", stagedagSchema);
