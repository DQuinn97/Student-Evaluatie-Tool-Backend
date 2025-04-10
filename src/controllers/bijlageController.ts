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

// check of er verwijderde bijlagen binnenkomen
export const checkCleanupBijlagen = async (
  bijlagen: mongoose.Types.ObjectId[],
  nieuweBijlagen: mongoose.Types.ObjectId[]
) => {
  return bijlagen.filter((bijlage) => !nieuweBijlagen.includes(bijlage));
};

// verwijder bijlagen die niet gebruikt worden
export const cleanupBijlagen = async (
  bijlageIds: mongoose.Types.ObjectId[]
) => {
  for (let id of bijlageIds) {
    const bijlage = await Bijlage.findById(id);
    if (!bijlage) throw new NotFoundError("Bijlage niet gevonden");
    if (
      !(await Taak.findOne({ bijlagen: id })) &&
      !(await Stagedag.findOne({ bijlagen: id })) &&
      !(await Stageverslag.findOne({ bijlagen: id })) &&
      !(await Inzending.findOne({ bijlagen: id }))
    ) {
      await cloudinary.uploader.destroy(bijlage.publicId, { invalidate: true });
    }
    await Bijlage.findByIdAndDelete(id);
  }
  return;
};

// stop nieuwe bijlagen in de db
export const uploadBijlagen = async (
  file_uploads: UploadApiResponse[],
  gebruiker: TGebruiker
) => {
  const bijlagen = [];

  for (let file of file_uploads) {
    const bijlage = await Bijlage.create({
      URL: file.url,
      gebruiker: gebruiker.id,
      publicId: file.public_id,
    });
    bijlagen.push(bijlage);
  }

  return bijlagen;
};

export const getBijlagen = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    if (gebruiker.isDocent) {
      const bijlagen = await Bijlage.find().populate({
        path: "gebruiker",
        select: "_id naam achternaam email foto isDocent",
      });
      res.status(200).json(bijlagen);
    } else {
      const bijlagen = await Bijlage.find({ gebruiker: gebruiker.id });
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

    const bijlagen = await uploadBijlagen(file_uploads, gebruiker);

    res.status(201).json(bijlagen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteBijlage = async (req: Request, res: Response) => {
  try {
    const { bijlageId: id } = req.params;

    const bijlage = await Bijlage.findByIdAndDelete(id);
    if (!bijlage) throw new NotFoundError("Bijlage niet gevonden");

    await Taak.updateMany({ bijlagen: id }, { $pull: { bijlagen: id } });
    await Inzending.updateMany({ bijlagen: id }, { $pull: { bijlagen: id } });
    await Stagedag.updateMany({ bijlagen: id }, { $pull: { bijlagen: id } });
    await Stageverslag.updateMany(
      { bijlagen: id },
      { $pull: { bijlagen: id } }
    );

    await cloudinary.uploader.destroy(bijlage.publicId, { invalidate: true });

    res.status(204).json(bijlage);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
