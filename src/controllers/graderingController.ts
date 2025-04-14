import { Request, Response } from "../utils/types";
import { Gradering, TGradering } from "../models/GraderingModel";
import { Inzending } from "../models/InzendingModel";
import { ErrorHandler, NotFoundError } from "../utils/errors";
import { Taak } from "../models/TaakModel";

// Voeg de taak en inzending toe aan de gradering
// Dit kan niet in de database gedaan worden omdat het een circulaire referentie zou vormen
const appendInzending = async (gradering: TGradering) => {
  // Check of gradering en inzending bestaan
  if (!gradering) return gradering;
  const inzending = await Inzending.findOne({
    gradering: gradering._id,
  }).select("-gradering");
  if (!inzending) return gradering;

  // Zoek de taak waarop de inzending is gemaakt
  const taak = await Taak.findOne({ inzendingen: inzending._id }).select(
    "-inzendingen"
  );

  // Stuur het uitgebreide gradering object terug
  return { ...gradering.toJSON(), inzending, taak };
};

export const getGradering = async (req: Request, res: Response) => {
  try {
    // Check of gradering bestaat
    const { graderingId: id } = req.params;
    const gradering = await Gradering.findById(id);
    if (!gradering) throw new NotFoundError("Gradering niet gevonden");

    // Voeg taak en inzending toe
    const response = await appendInzending(gradering);

    // Success response met gradering; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addGradering = async (req: Request, res: Response) => {
  try {
    const { inzendingId } = req.params;
    const { score, maxscore, feedback } = req.body;
    const gebruiker = req.gebruiker;

    // Check of inzending bestaat
    const inzending = await Inzending.findById(inzendingId);
    if (!inzending) throw new NotFoundError("Inzending niet gevonden");

    // Maak gradering aan van huidig ingelogde gebruiker
    const gradering = await Gradering.create({
      score,
      maxscore: maxscore || 100,
      feedback,
      docent: gebruiker._id,
    });

    // Voeg gradering toe aan inzending
    await Inzending.findByIdAndUpdate(inzendingId, {
      $push: { gradering: gradering._id },
    });

    // Voeg taak en inzending toe
    const response = await appendInzending(gradering);

    // Success response met gradering; 201 - Created
    res.status(201).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateGradering = async (req: Request, res: Response) => {
  try {
    // Check of gradering bestaat en update deze
    const { graderingId: id } = req.params;
    const { score, maxscore, feedback } = req.body;
    const gradering = await Gradering.findByIdAndUpdate(
      id,
      { score, feedback, maxscore },
      { new: true }
    );
    if (!gradering) throw new NotFoundError("Gradering niet gevonden");

    // Voeg taak en inzending toe
    const response = await appendInzending(gradering);

    // Success response met gradering; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
