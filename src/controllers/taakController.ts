import { Request, Response } from "express";
import { Taak } from "../models/TaakModel";
import { Klasgroep } from "../models/KlasgroepModel";
import { TGradering } from "../models/GraderingModel";
import { TInzending } from "../models/InzendingModel";
import { klasgroepPath, vakPath } from "../utils/helpers";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";

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
    const {
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      vak,
      isGepubliceerd,
      bijlagen,
    } = req.body;

    if (!klasgroepId || !titel || !beschrijving || !deadline || !weging)
      throw new BadRequestError(
        "KlasgroepId, titel, beschrijving, deadline en weging zijn verplicht"
      );

    const klasgroep = await Klasgroep.findById(klasgroepId);

    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    if (vak && !klasgroep.vakken.includes(vak))
      throw new BadRequestError("Vak niet gevonden in klasgroep");

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
    res.status(201).json({ message: "Taak aangemaakt", taak });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const {
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      vak,
      isGepubliceerd,
      bijlagen,
    } = req.body;

    const check = await Taak.findById(taakId);
    const klasgroep = await Klasgroep.findById(check?.klasgroep);

    if (!check) throw new NotFoundError("Taak niet gevonden");
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");
    if (vak && klasgroep && !klasgroep.vakken.includes(vak))
      throw new BadRequestError("Vak niet gevonden in klasgroep");

    const taak = await Taak.findByIdAndUpdate(
      taakId,
      {
        type: type ? type : check?.type,
        titel: titel ? titel : check?.titel,
        beschrijving: beschrijving ? beschrijving : check?.beschrijving,
        deadline: deadline ? deadline : check?.deadline,
        weging: weging ? weging : check?.weging,
        vak: vak ? vak : check?.vak,
        isGepubliceerd: isGepubliceerd ? isGepubliceerd : check?.isGepubliceerd,
        bijlagen,
      },
      { new: true }
    );
    res.status(201).json({ message: "Taak gewijzigd", taak });
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

    res.status(201).json({ message: "Taak gedupliceerd", taak: nieuweTaak });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const taak = await Taak.findByIdAndDelete(taakId);
    if (!taak) throw new NotFoundError("Taak niet gevonden");
    res.status(204).json({ message: "Taak verwijderd", taak });
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
