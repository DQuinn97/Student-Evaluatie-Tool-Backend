import { Request, Response } from "../utils/types";
import { Inzending, TInzending } from "../models/InzendingModel";
import { Taak } from "../models/TaakModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";
import { Gebruiker } from "../models/GebruikerModel";
import {
  checkCleanupBijlagen,
  cleanupBijlagen,
  uploadBijlagen,
} from "./bijlageController";

// Voeg taak toe in de meegegeven inzendingen
// Dit kan niet in de database omdat dit een circulaire referentie geeft
const appendTaken = async (inzendingen: TInzending[]) => {
  if (!inzendingen) return inzendingen;
  // Loop over de inzendingen
  const response = await Promise.all(
    inzendingen?.map(async (inzending) => {
      // Zoek de taak waarop de inzending is gemaakt
      const taak = await Taak.findOne({ inzendingen: inzending._id }).select(
        "-inzendingen"
      );
      // Stuur het uitgebreide inzending object terug
      return { ...inzending.toJSON(), taak };
    })
  );
  // Stuur de uitgebreide inzendingen array terug
  return response;
};

export const getInzending = async (req: Request, res: Response) => {
  try {
    // Check of inzending bestaat
    const { inzendingId: id } = req.params;
    const inzending = await Inzending.findById(id).populate("gradering");
    if (!inzending) throw new NotFoundError("Inzending niet gevonden");

    // Voeg taak toe -> inzending is geen array, dus gebruik array met 1 element
    const response = (await appendTaken([inzending]))[0];

    // Success response met inzending; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addInzending = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const { git, live, beschrijving, bijlagen, file_uploads } = req.body;

    const gebruiker = req.gebruiker;

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Check of taak bestaat
    const taak = await Taak.findById(taakId).populate("inzendingen");
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Maak nieuwe inzending aan
    const inzending = await Inzending.create({
      git,
      live,
      beschrijving,
      student: gebruiker._id,
      inzending: Date.now(),
      bijlagen,
    });

    // Voeg inzending toe aan taak
    taak.inzendingen.push(inzending._id);
    await taak.save();

    // Voeg taak toe
    const response = (await appendTaken([inzending]))[0];

    // Success response met inzending; 201 - Created
    res.status(201).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateInzending = async (req: Request, res: Response) => {
  try {
    const { inzendingId: id } = req.params;
    const { git, live, beschrijving, bijlagen, file_uploads } = req.body;

    const gebruiker = req.gebruiker;

    // Check of inzending bestaat
    const inzending = await Inzending.findById(id);
    if (!inzending) throw new NotFoundError("Inzending niet gevonden");

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Update inzending
    const updated = await Inzending.findByIdAndUpdate(
      id,
      { git, live, beschrijving, inzending: Date.now(), bijlagen },
      { new: true }
    );
    if (!updated) throw new NotFoundError("Inzending niet gevonden");

    // Check of bijlagen verwijderd moeten worden
    await cleanupBijlagen(
      await checkCleanupBijlagen(inzending.bijlagen, updated.bijlagen)
    );

    // Voeg taak toe
    const response = (await appendTaken([updated]))[0];

    // Success response met inzending; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getInzendingenPerTaak = async (req: Request, res: Response) => {
  try {
    // Check of taak bestaat
    const { taakId } = req.params;
    const taak = await Taak.findById(taakId).populate({
      path: "inzendingen",
      populate: { path: "gradering" },
    });
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Success response met inzendingen per taak; 200 - OK
    const inzendingen = taak.inzendingen || [];
    res.status(200).json(inzendingen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getInzendingen = async (req: Request, res: Response) => {
  try {
    // Vraag alle inzendingen op van de ingelogde gebruiker
    const gebruiker = req.gebruiker;
    const inzendingen = await Inzending.find({
      student: gebruiker._id,
    }).populate("gradering");

    // Voet taken toe
    const response = await appendTaken(inzendingen);

    // Success response met inzendingen; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getInzendingenPerStudent = async (req: Request, res: Response) => {
  try {
    // Check of gebruiker bestaat
    const { studentId } = req.params;
    const student = await Gebruiker.findById(studentId);
    if (!student) throw new NotFoundError("Student niet gevonden");

    // Vraag alle inzendingen op van de opgevraagde gebruiker
    const inzendingen = await Inzending.find({ student: studentId });

    // Voeg taken toe
    const response = await appendTaken(inzendingen);

    // Success response met inzendingen; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
