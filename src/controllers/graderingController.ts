import { Request, Response } from "express";
import { Todo } from "../models/exampleModel";
import { Error as MongooseError } from "mongoose";
import { Gradering } from "../models/GraderingModel";
import { Inzending } from "../models/InzendingModel";
const { ValidationError } = MongooseError;

export const getGradering = async (req: Request, res: Response) => {
  try {
    const gradering = await Gradering.find();
    res.status(200).json(gradering);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const addGradering = async (req: Request, res: Response) => {
  try {
    const { inzendingId } = req.params;
    const { score, feedback } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const gradering = await Gradering.create({
      score,
      feedback,
      docent: gebruiker._id,
    });

    await Inzending.findByIdAndUpdate(inzendingId, {
      $push: { gradering: gradering._id },
    });

    res.status(201).json(gradering);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const updateGradering = async (req: Request, res: Response) => {
  try {
    const { graderingId: id } = req.params;
    const { score, feedback } = req.body;
    const gradering = await Gradering.findByIdAndUpdate(
      id,
      { score, feedback },
      { new: true }
    );
    res.status(200).json(gradering);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};