import mongoose, { HydratedDocumentFromSchema } from "mongoose";

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
    collection: "vakken",
  }
);
export type TVak = HydratedDocumentFromSchema<typeof vakSchema>;
export const Vak = mongoose.model("Vak", vakSchema);
