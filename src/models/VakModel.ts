import mongoose from "mongoose";

const vakSchema = new mongoose.Schema(
  {
    naam: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vak = mongoose.model("Vak", vakSchema);
