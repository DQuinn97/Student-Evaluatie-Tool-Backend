import mongoose from "mongoose";

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
  },
  {
    timestamps: true,
  }
);

export const Klasgroep = mongoose.model("Klasgroep", klasgroepSchema);
