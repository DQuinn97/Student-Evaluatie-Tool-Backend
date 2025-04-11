import { Request, Response } from "express";
import { ErrorHandler, NotFoundError } from "../utils/errors";
import { Bijlage } from "../models/BijlageModel";
import cloudinary, { UploadApiResponse } from "../utils/cloudinary";
import { Stagedag } from "../models/StagedagModel";
import { Stageverslag } from "../models/StageverslagModel";
import { Inzending } from "../models/InzendingModel";
import { Taak } from "../models/TaakModel";
import { TGebruiker } from "../models/GebruikerModel";
import mongoose from "mongoose";

// Check welke bijlagen niet meer gebruikt worden
export const checkCleanupBijlagen = async (
  bijlagen: mongoose.Types.ObjectId[],
  nieuweBijlagen: mongoose.Types.ObjectId[]
): Promise<mongoose.Types.ObjectId[]> => {
  return bijlagen.filter((bijlage) => !nieuweBijlagen.includes(bijlage));
};

// Verwijder bijlagen die niet gebruikt worden
export const cleanupBijlagen = async (
  bijlageIds: mongoose.Types.ObjectId[]
) => {
  // Loop door alle bijlagen
  for (let id of bijlageIds) {
    // Check of bijlage wel bestaat
    const bijlage = await Bijlage.findById(id);
    if (!bijlage) throw new NotFoundError("Bijlage niet gevonden");

    if (
      !(await Taak.findOne({ bijlagen: id })) &&
      !(await Stagedag.findOne({ bijlagen: id })) &&
      !(await Stageverslag.findOne({ bijlagen: id })) &&
      !(await Inzending.findOne({ bijlagen: id }))
    ) {
      // Als bijlage nergens meer gebruikt word -> verwijder deze van de cloud
      await cloudinary.uploader.destroy(bijlage.publicId, { invalidate: true });
    }
    await Bijlage.findByIdAndDelete(id);
  }
  return;
};

// Stop nieuwe bijlagen in de db
export const uploadBijlagen = async (
  file_uploads: UploadApiResponse[],
  gebruiker: TGebruiker
) => {
  const bijlagen = [];

  for (let file of file_uploads) {
    // Voor elke file in file_uploads -> maak een bijlage in db aan
    const bijlage = await Bijlage.create({
      URL: file.url,
      gebruiker: gebruiker.id,
      publicId: file.public_id,
    });
    bijlagen.push(bijlage.id);
  }

  // Return alle nieuwe toegevoegde bijlagen
  return bijlagen;
};

export const getBijlagen = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    if (gebruiker.isDocent) {
      // Als gebruiker een docent is -> geef alle bijlagen
      const bijlagen = await Bijlage.find().populate({
        path: "gebruiker",
        select: "_id naam achternaam email foto isDocent",
      });
      res.status(200).json(bijlagen);
    } else {
      // Als gebruiker geen docent is -> geef alle eigen bijlagen
      const bijlagen = await Bijlage.find({ gebruiker: gebruiker.id });

      // Success response; 200 - OK
      res.status(200).json(bijlagen);
    }
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addBijlagen = async (req: Request, res: Response) => {
  try {
    const { file_uploads } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    // Voeg bijlagen toe in db
    const bijlagen = await uploadBijlagen(file_uploads, gebruiker);

    // Success response; 201 - Created
    res.status(201).json(bijlagen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteBijlage = async (req: Request, res: Response) => {
  try {
    // Check of bijlage bestaat, en verwijder deze
    const { bijlageId: id } = req.params;
    const bijlage = await Bijlage.findByIdAndDelete(id);
    if (!bijlage) throw new NotFoundError("Bijlage niet gevonden");

    // Verwijder de referentie naar de verwijderde bijlage
    await Taak.updateMany({ bijlagen: id }, { $pull: { bijlagen: id } });
    await Inzending.updateMany({ bijlagen: id }, { $pull: { bijlagen: id } });
    await Stagedag.updateMany({ bijlagen: id }, { $pull: { bijlagen: id } });
    await Stageverslag.updateMany(
      { bijlagen: id },
      { $pull: { bijlagen: id } }
    );

    // Verwijder de bijlage uit de cloud
    await cloudinary.uploader.destroy(bijlage.publicId, { invalidate: true });

    // Success response; 204 - No content
    res.status(204).json(bijlage);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
