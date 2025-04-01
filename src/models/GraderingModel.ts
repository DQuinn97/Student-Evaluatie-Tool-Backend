import mongoose from "mongoose";

const graderingSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Gradering = mongoose.model("Gradering", graderingSchema);
