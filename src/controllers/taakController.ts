import { Request, Response } from "express";
import { Taak } from "../models/TaakModel";
import { Klasgroep } from "../models/KlasgroepModel";
import { Gradering, TGradering } from "../models/GraderingModel";
import { Inzending, TInzending } from "../models/InzendingModel";
import { klasgroepPath, vakPath } from "../utils/helpers";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";
import {
  checkCleanupBijlagen,
  cleanupBijlagen,
  uploadBijlagen,
} from "./bijlageController";

export const getTaken = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const filter = { klasgroep: klasgroepId };
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const taken = await Taak.find(filter).populate([
      {
        path: "inzendingen",

        populate: [
          {
            path: "gradering",
            populate: { path: "docent", select: "-wachtwoord" },
          },
          {
            path: "student",
            select: "-wachtwoord",
          },
        ],
        match: gebruiker.isDocent ? {} : { student: gebruiker._id },
      },
      "bijlagen",
      klasgroepPath,
      vakPath,
    ]);

    res.status(200).json(taken);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getAlleTaken = async (req: Request, res: Response) => {
  try {
    const taken = await Taak.find().populate([
      {
        path: "inzendingen",

        populate: [
          {
            path: "gradering",
            populate: { path: "docent", select: "-wachtwoord" },
          },
          {
            path: "student",
            select: "-wachtwoord",
          },
        ],
      },
      "bijlagen",
      klasgroepPath,
      vakPath,
    ]);

    res.status(200).json(taken);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const taak = await Taak.findById(taakId).populate([
      {
        path: "inzendingen",

        populate: [
          {
            path: "gradering",
            populate: { path: "docent", select: "-wachtwoord" },
          },
          {
            path: "student",
            select: "-wachtwoord",
          },
        ],
        match: gebruiker.isDocent ? {} : { student: gebruiker._id },
      },
      "bijlagen",
      klasgroepPath,
      vakPath,
    ]);

    res.status(200).json(taak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addTaak = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const {
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      vak,
      isGepubliceerd,
      bijlagen,
      file_uploads,
    } = req.body;

    if (!klasgroepId || !titel || !beschrijving || !deadline || !weging)
      throw new BadRequestError(
        "KlasgroepId, titel, beschrijving, deadline en weging zijn verplicht"
      );

    const klasgroep = await Klasgroep.findById(klasgroepId);

    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    if (vak && !klasgroep.vakken.includes(vak))
      throw new BadRequestError("Vak niet gevonden in klasgroep");

    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    const taak = await Taak.create({
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      klasgroep: klasgroepId,
      vak,
      isGepubliceerd,
      bijlagen,
    });
    res.status(201).json(taak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateTaak = async (req: Request, res: Response) => {
  try {
    const { taakId: id } = req.params;
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const {
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      vak,
      isGepubliceerd,
      bijlagen,
      file_uploads,
    } = req.body;

    const taak = await Taak.findById(id);
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    const klasgroep = await Klasgroep.findById(taak.klasgroep);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    if (vak && klasgroep && !klasgroep.vakken.includes(vak))
      throw new BadRequestError("Vak niet gevonden in klasgroep");

    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    const updated = await Taak.findByIdAndUpdate(
      id,
      {
        type: type ? type : taak?.type,
        titel: titel ? titel : taak?.titel,
        beschrijving: beschrijving ? beschrijving : taak?.beschrijving,
        deadline: deadline ? deadline : taak?.deadline,
        weging: weging ? weging : taak?.weging,
        vak: vak ? vak : taak?.vak,
        isGepubliceerd: isGepubliceerd ? isGepubliceerd : taak?.isGepubliceerd,
        bijlagen,
      },
      { new: true }
    );
    if (!updated) throw new NotFoundError("Taak niet gevonden");
    await cleanupBijlagen(
      await checkCleanupBijlagen(taak.bijlagen, updated.bijlagen)
    );

    res.status(201).json(updated);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const dupliceerTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const { klasgroepId } = req.body;

    if (!klasgroepId) throw new BadRequestError("klasgroepId zijn verplicht");

    const taak = await Taak.findById(taakId);
    const klasgroep = await Klasgroep.findById(klasgroepId);
    if (!taak) throw new NotFoundError("Taak niet gevonden");
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    const middernacht = new Date().setUTCHours(24, 0, 0, 0);
    const nieuweTaak = await Taak.create({
      type: taak.type,
      titel: taak.titel,
      beschrijving: taak.beschrijving,
      deadline: middernacht,
      weging: taak.weging,
      klasgroep: klasgroepId,
      isGepubliceerd: false,
      bijlagen: [...taak.bijlagen],
    });

    res.status(201).json(nieuweTaak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const taak = await Taak.findByIdAndDelete(taakId);
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    for (let inzending of taak.inzendingen) {
      let deleted = await Inzending.findByIdAndDelete(inzending);
      if (deleted) {
        await cleanupBijlagen(deleted.bijlagen);
        for (let gradering of deleted.gradering) {
          await Gradering.findByIdAndDelete(gradering);
        }
      }
    }
    await cleanupBijlagen(taak.bijlagen);

    res.status(204).json(taak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getAverage = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const taak = await Taak.findById(taakId).populate<{
      inzendingen: (Omit<TInzending, "gradering"> & {
        gradering: TGradering[];
      })[];
    }>({
      path: "inzendingen",
      populate: { path: "gradering" },
    });

    if (!taak) throw new NotFoundError("Taak niet gevonden");

    const graderingen = taak.inzendingen
      .map((inzending) => inzending.gradering)
      .flat();
    const average =
      graderingen.reduce((acc, gradering) => acc + gradering.score, 0) /
      graderingen.length;

    res.status(200).json(average);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
