import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { Taak, TTaak } from "../models/TaakModel";
import { Klasgroep } from "../models/KlasgroepModel";
import { Gradering, TGradering } from "../models/GraderingModel";
import { Inzending, TInzending } from "../models/InzendingModel";
import { isDocent } from "../middleware/authMiddleware";
const { ValidationError } = MongooseError;

export const getTaken = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const filter = { klasgroep: klasgroepId };

    const taken = await Taak.find(filter)
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("vak", "_id naam")
      .populate("bijlagen");
    console.log(18, taken);
    res.status(200).json(taken);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getAlleTaken = async (req: Request, res: Response) => {
  try {
    const taken = await Taak.find()
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("vak", "_id naam")
      .populate("bijlagen");

    res.status(200).json(taken);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
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
          { path: "gradering" },
          {
            path: "student",
            select: "-wachtwoord",
          },
        ],
        match: gebruiker.isDocent ? {} : { student: gebruiker._id },
      },
      "bijlagen",
      { path: "klasgroep", select: "_id naam beginjaar eindjaar" },
      { path: "vak", select: "_id naam" },
    ]);
    
    res.status(200).json(taak);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
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

    if (!klasgroepId || !titel || !beschrijving || !deadline || !weging) {
      res.status(400).json({ message: "Onvolledige taak data" });
      return;
    }

    const klasgroep = await Klasgroep.findById(klasgroepId);

    if (!klasgroep) {
      res.status(400).json({ message: "Klasgroep niet gevonden" });
      return;
    }

    if (vak && !klasgroep.vakken.includes(vak)) {
      res.status(400).json({ message: "Vak niet gevonden in deze klasgroep" });
      return;
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
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
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

    if (vak && klasgroep && !klasgroep.vakken.includes(vak)) {
      res.status(400).json({ message: "Vak niet gevonden in deze klasgroep" });
      return;
    }

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
    res.status(201).json(taak);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const dupliceerTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const { klasgroepId } = req.body;

    if (!taakId || !klasgroepId) {
      res.status(400).json({ message: "taakId en klasgroepId zijn verplicht" });
      return;
    }

    const taak = await Taak.findById(taakId);
    const klasgroep = await Klasgroep.findById(klasgroepId);
    if (!taak || !klasgroep) {
      res.status(400).json({ message: "Taak of klasgroep niet gevonden" });
      return;
    }

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
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const deleteTaak = async (req: Request, res: Response) => {
  try {
    const { taakId } = req.params;
    const taak = await Taak.findByIdAndDelete(taakId);
    res.status(200).json({ message: "Taak verwijderd" });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
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

    if (!taak) {
      throw new Error("Taak niet gevonden");
    }

    const graderingen = taak.inzendingen
      .map((inzending) => inzending.gradering)
      .flat();
    const average =
      graderingen.reduce((acc, gradering) => acc + gradering.score, 0) /
      graderingen.length;

    res.status(200).json(average);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
