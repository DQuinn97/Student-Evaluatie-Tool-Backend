import { Request, Response } from "express";
import { Todo } from "../models/exampleModel";
import { ErrorHandler } from "../utils/helpers";

export const getHelloWorld = (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello World!" });
};

export const getTodos = async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addTodo = async (req: Request, res: Response) => {
  try {
    const { task } = req.body;
    const todo = await Todo.create({ task });
    res.status(201).json(todo);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { task, done } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      id,
      { task, done },
      { new: true }
    );
    res.status(200).json(todo);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
