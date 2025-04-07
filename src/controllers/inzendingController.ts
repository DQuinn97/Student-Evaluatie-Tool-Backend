import { Request, Response } from "express";
import { Inzending, TInzending } from "../models/InzendingModel";
import { Taak } from "../models/TaakModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/helpers";
import { Gebruiker } from "../models/GebruikerModel";

// voeg taak toe in response van inzending
const appendTaken = async (inzendingen: TInzending[]) => {
  if (!inzendingen) return inzendingen;
  const response = await Promise.all(
    inzendingen?.map(async (inzending) => {
      const taak = await Taak.findOne({ inzendingen: inzending._id }).select(
        "-inzendingen"
      );
      return { ...inzending.toJSON(), taak };
    })
  );
  return response;
};

export const getInzending = async (req: Request, res: Response) => {
  try {
    const { inzendingId: id } = req.params;
    const inzending = await Inzending.findById(id).populate("gradering");
    if (!inzending) throw new NotFoundError("Inzending niet gevonden");
    const response = (await appendTaken([inzending]))[0];
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addInzending = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const { git, live, beschrijving } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const taak = await Taak.findById(taakId).populate("inzendingen");
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    const inzending = await Inzending.create({
      git,
      live,
      beschrijving,
      student: gebruiker._id,
      inzending: Date.now(),
    });
    taak.inzendingen.push(inzending._id);
    await taak.save();

    res.status(201).json(inzending);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateInzending = async (req: Request, res: Response) => {
  try {
    const { inzendingId: id } = req.params;
    const { git, live, beschrijving } = req.body;
    const inzending = await Inzending.findByIdAndUpdate(
      id,
      { git, live, beschrijving, inzending: Date.now() },
      { new: true }
    );
    if (!inzending) throw new NotFoundError("Inzending niet gevonden");
    const response = (await appendTaken([inzending]))[0];
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getInzendingenPerTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const taak = await Taak.findById(taakId);
    if (!taak) throw new NotFoundError("Taak niet gevonden");
    const inzendingen =
      (
        await Taak.findById(taakId).populate({
          path: "inzendingen",
          populate: { path: "gradering" },
        })
      )?.inzendingen || [];

    res.status(200).json(inzendingen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getInzendingen = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const inzendingen = await Inzending.find({
      student: gebruiker._id,
    }).populate("gradering");
    const response = await appendTaken(inzendingen);

    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getInzendingenPerStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const student = await Gebruiker.findById(studentId);
    if (!student) throw new NotFoundError("Student niet gevonden");
    const inzendingen = await Inzending.find({ student: studentId });
    const response = await appendTaken(inzendingen);

    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
