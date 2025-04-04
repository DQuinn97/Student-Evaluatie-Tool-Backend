import mongoose, { HydratedDocumentFromSchema } from "mongoose";

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
    collection: "bijlagen",
  }
);
export type TBijlage = HydratedDocumentFromSchema<typeof bijlageSchema>;

export const Bijlage = mongoose.model("Bijlage", bijlageSchema);
