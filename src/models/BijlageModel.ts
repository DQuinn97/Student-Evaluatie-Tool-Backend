import mongoose from "mongoose";

const bijlageSchema = new mongoose.Schema(
  {
    URL: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Bijlage = mongoose.model("Bijlage", bijlageSchema);
