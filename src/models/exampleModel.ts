import mongoose from "mongoose";

interface ITodo {
  task: string;
  done: boolean;
}
const todoSchema = new mongoose.Schema<ITodo>(
  {
    task: {
      type: String,
      required: true,
      trim: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Todo = mongoose.model<ITodo>("Todo", todoSchema);
