import mongoose, { Schema } from "mongoose";

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
        ref: "Gebruiker",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Klasgroep = mongoose.model("Klasgroep", klasgroepSchema);
