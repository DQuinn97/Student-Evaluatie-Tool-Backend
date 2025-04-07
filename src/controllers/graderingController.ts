import { Request, Response } from "express";
import { Gradering } from "../models/GraderingModel";
import { Inzending } from "../models/InzendingModel";
import {
  BadRequestError,
  ErrorHandler,
} from "../utils/helpers";

export const getGradering = async (req: Request, res: Response) => {
  try {
    const { graderingId: id } = req.params;
    const gradering = await Gradering.findById(id);
    if (!gradering) throw new BadRequestError("Gradering niet gevonden");
    res.status(200).json(gradering);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
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
    ErrorHandler(error, req, res);
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
    ErrorHandler(error, req, res);
  }
};
