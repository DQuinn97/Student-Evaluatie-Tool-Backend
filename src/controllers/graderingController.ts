import { Request, Response } from "express";
import { Gradering, TGradering } from "../models/GraderingModel";
import { Inzending } from "../models/InzendingModel";
import { ErrorHandler, NotFoundError } from "../utils/errors";
import { Taak } from "../models/TaakModel";

const appendInzending = async (gradering: TGradering) => {
  if (!gradering) return gradering;
  const inzending = await Inzending.findOne({
    gradering: gradering._id,
  }).select("-gradering");
  if (!inzending) return gradering;
  const taak = await Taak.findOne({ inzendingen: inzending._id }).select(
    "-inzendingen"
  );

  return { ...gradering.toJSON(), inzending, taak };
};
export const getGradering = async (req: Request, res: Response) => {
  try {
    const { graderingId: id } = req.params;
    const gradering = await Gradering.findById(id);
    if (!gradering) throw new NotFoundError("Gradering niet gevonden");

    const response = await appendInzending(gradering);

    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addGradering = async (req: Request, res: Response) => {
  try {
    const { inzendingId } = req.params;
    const { score, maxscore, feedback } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const inzending = await Inzending.findById(inzendingId);
    if (!inzending) throw new NotFoundError("Inzending niet gevonden");

    const gradering = await Gradering.create({
      score,
      maxscore: maxscore || 100,
      feedback,
      docent: gebruiker._id,
    });

    await Inzending.findByIdAndUpdate(inzendingId, {
      $push: { gradering: gradering._id },
    });

    const response = await appendInzending(gradering);
    res
      .status(201)
      .json({ message: "Gradering toegevoegd", gradering: response });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateGradering = async (req: Request, res: Response) => {
  try {
    const { graderingId: id } = req.params;
    const { score, maxscore, feedback } = req.body;
    const gradering = await Gradering.findByIdAndUpdate(
      id,
      { score, feedback, maxscore },
      { new: true }
    );
    if (!gradering) throw new NotFoundError("Gradering niet gevonden");

    const response = await appendInzending(gradering);

    res
      .status(200)
      .json({ message: "Gradering bijgewerkt", gradering: response });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
