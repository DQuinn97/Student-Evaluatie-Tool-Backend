import { Request, Response } from "express";
import { Todo } from "../models/exampleModel";
import { ErrorHandler } from "../utils/errors";
import { Bijlage } from "../models/BijlageModel";

export const getBijlagen = async (req: Request, res: Response) => {
  try {
    const bijlagen = await Bijlage.find();
    res.status(200).json(bijlagen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addBijlage = async (req: Request, res: Response) => {
  try {
    const { task } = req.body;
    const todo = await Todo.create({ task });
    res.status(201).json(todo);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
