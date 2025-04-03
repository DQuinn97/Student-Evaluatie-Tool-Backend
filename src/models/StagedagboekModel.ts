import mongoose, { Schema } from "mongoose";
import { Gebruiker } from "./GebruikerModel";
import { Klasgroep } from "./KlasgroepModel";
import { Stageverslag } from "./StageverslagModel";
import { Stagedag } from "./StagedagModel";

const stagedagboekSchema = new mongoose.Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: Gebruiker,
      required: true,
      trim: true,
    },
    klasgroep: {
      type: Schema.Types.ObjectId,
      ref: Klasgroep,
      required: true,
      trim: true,
    },
    stageverslag: {
      type: Schema.Types.ObjectId,
      ref: Stageverslag,
      nullable: true,
    },
    stagedagen: [
      {
        type: Schema.Types.ObjectId,
        ref: Stagedag,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: "stagedagboeken"
  }
);

export const Stagedagboek = mongoose.model("Stagedagboek", stagedagboekSchema);
