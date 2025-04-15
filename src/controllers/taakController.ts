import { Request, Response } from "../utils/types";
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
    const gebruiker = req.gebruiker;

    // Check of klasgroep bestaat
    const klasgroep = await Klasgroep.findById(klasgroepId);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Zoek alle taken uit een klasgroep op die zichtbaar zijn voor de ingelogde gebruiker
    const taken = await Taak.find({ klasgroep: klasgroepId }).populate([
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

    // Success response met taken; 200 - OK
    res.status(200).json(taken);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getAlleTaken = async (req: Request, res: Response) => {
  try {
    // Zoek alle bestaande taken op
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

    // Success response met taken; 200 - OK
    res.status(200).json(taken);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const gebruiker = req.gebruiker;

    // Check of taak bestaat
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
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Success response met taak; 200 - OK
    res.status(200).json(taak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addTaak = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const gebruiker = req.gebruiker;
    const {
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      vak,
      maxScore,
      isGepubliceerd,
      bijlagen,
      file_uploads,
    } = req.body;

    // Check of klasgroep bestaat
    const klasgroep = await Klasgroep.findById(klasgroepId);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    console.log(req.body);

    // Check of titel, beschrijving, deadline en weging in req.body zijn meegegeven
    if (!titel || !beschrijving || !deadline || !weging)
      throw new BadRequestError(
        "'titel', 'beschrijving', 'deadline' en 'weging' zijn verplicht"
      );

    // Check of vak in klasgroep zit
    if (vak && !klasgroep.vakken.includes(vak))
      throw new BadRequestError("Vak niet gevonden in klasgroep");

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Maak nieuwe taak aan
    const taak = await Taak.create({
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      klasgroep: klasgroepId,
      vak,
      maxScore,
      isGepubliceerd,
      bijlagen,
    });

    // Success response met taak; 201 - Created
    res.status(201).json(taak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const updateTaak = async (req: Request, res: Response) => {
  try {
    const { taakId: id } = req.params;

    const gebruiker = req.gebruiker;
    const {
      type,
      titel,
      beschrijving,
      deadline,
      weging,
      vak,
      maxScore,
      isGepubliceerd,
      bijlagen,
      file_uploads,
    } = req.body;

    // Check of taak bestaat
    const taak = await Taak.findById(id);
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Check of klasgroep van taak bestaat
    const klasgroep = await Klasgroep.findById(taak.klasgroep);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Check of vak bestaat in klasgroep
    if (vak && klasgroep && !klasgroep.vakken.includes(vak))
      throw new BadRequestError("Vak niet gevonden in klasgroep");

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Wijzig taak
    const updated = await Taak.findByIdAndUpdate(
      id,
      {
        type: type ? type : taak?.type,
        titel: titel ? titel : taak?.titel,
        beschrijving: beschrijving ? beschrijving : taak?.beschrijving,
        deadline: deadline ? deadline : taak?.deadline,
        weging: weging ? weging : taak?.weging,
        vak: vak ? vak : taak?.vak,
        maxScore: maxScore ? maxScore : taak?.maxScore,
        isGepubliceerd: isGepubliceerd ? isGepubliceerd : taak?.isGepubliceerd,
        bijlagen,
      },
      { new: true }
    ).populate([vakPath]);
    if (!updated) throw new NotFoundError("Taak niet gevonden");

    // Check of bijlagen mogen verwijderd worden
    await cleanupBijlagen(
      await checkCleanupBijlagen(taak.bijlagen, updated.bijlagen)
    );

    // Success response met taak; 200 - OK
    res.status(200).json(updated);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const dupliceerTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const { klasgroepId } = req.body;

    // Check of taak bestaat
    const taak = await Taak.findById(taakId);
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Check of klasgroepId in req.body is meegegeven
    if (!klasgroepId) throw new BadRequestError("'klasgroepId' is verplicht");

    // Check of klasgroep bestaat
    const klasgroep = await Klasgroep.findById(klasgroepId);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Maak nieuwe taak aan van bestaande taak
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

    // Success response met taak; 201 - Created
    res.status(201).json(nieuweTaak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteTaak = async (req: Request, res: Response) => {
  try {
    // Check of taak bestaat
    const { taakId } = req.params;
    const taak = await Taak.findByIdAndDelete(taakId);
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Loop door inzendingen van taak
    for (let inzending of taak.inzendingen) {
      // Verwijder inzending
      let deleted = await Inzending.findByIdAndDelete(inzending);
      if (deleted) {
        // Check of bijlagen van inzending verwijderd kunnen worden
        await cleanupBijlagen(deleted.bijlagen);

        // Verwijder gradering
        await Gradering.findByIdAndDelete(deleted.gradering);
      }
    }

    // Check of bijlagen van taak verwijderd kunnen worden
    await cleanupBijlagen(taak.bijlagen);

    // Success response met verwijderde taak; 204 - No Content
    res.status(204).json(taak);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getAverage = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;

    // Check of taak bestaat
    const taak = await Taak.findById(taakId).populate<{
      inzendingen: (Omit<TInzending, "gradering"> & {
        gradering: TGradering[];
      })[];
    }>({
      path: "inzendingen",
      populate: { path: "gradering" },
    });
    if (!taak) throw new NotFoundError("Taak niet gevonden");

    // Haal het gemiddelde van alle graderingen op alle inzendingen op
    const graderingen = taak.inzendingen
      .map((inzending) => inzending.gradering)
      .flat();
    const average =
      graderingen.reduce((acc, gradering) => acc + gradering.score, 0) /
      graderingen.length;

    // Success response met gemiddelde; 200 - OK
    res.status(200).json(average);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
