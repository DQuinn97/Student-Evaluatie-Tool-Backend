import { Request, Response } from "express";
import { Stagedagboek } from "../models/StagedagboekModel";
import { Error as MongooseError } from "mongoose";
import { Stagedag } from "../models/StagedagModel";
import { Stageverslag } from "../models/StageverslagModel";
const { ValidationError } = MongooseError;

/*
 * STAGEDAGBOEK
 */
export const getDagboek = async (req: Request, res: Response) => {
  try {
    const { dagboekId: id } = req.params;
    const dagboek = await Stagedagboek.findById(id)
      .lean()
      .populate(["stageverslag", "stagedagen", "klasgroep"])
      .populate("student", "-wachtwoord");
    res.status(200).json(dagboek);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

/*
 * STAGEDAGEN
 */
export const getDag = async (req: Request, res: Response) => {
  try {
    const { dagId: id } = req.params;
    const dag = await Stagedag.findById(id);
    res.status(200).json(dag);
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
export const addDag = async (req: Request, res: Response) => {
  try {
    const { datum, voormiddag, namiddag, tools, resultaat, bijlagen } =
      req.body;
    const dag = await Stagedag.create({
      datum,
      voormiddag,
      namiddag,
      tools,
      resultaat,
      bijlagen,
    });
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const dagboek = await Stagedagboek.findOne({
      student: gebruiker._id,
    });
    dagboek?.stagedagen.push(dag._id);
    await dagboek?.save();
    res.status(201).json(dag);
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
export const updateDag = async (req: Request, res: Response) => {
  try {
    const { dagId: id } = req.params;
    const { datum, voormiddag, namiddag, tools, resultaat, bijlagen } =
      req.body;
    const dag = await Stagedag.findByIdAndUpdate(
      id,
      { datum, voormiddag, namiddag, tools, resultaat, bijlagen },
      { new: true }
    );
    res.status(200).json(dag);
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

export const deleteDag = async (req: Request, res: Response) => {
  try {
    // TODO delete files related to this
    const { dagId: id } = req.params;
    const dag = await Stagedag.findByIdAndDelete(id);
    res.status(200).json(dag);
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

/*
 * STAGEVERSLAG
 */
export const getVerslag = async (req: Request, res: Response) => {
  try {
    const { verslagId: id } = req.params;
    const verslag = await Stageverslag.findById(id);
    res.status(200).json(verslag);
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
export const addVerslag = async (req: Request, res: Response) => {
  try {
    const {
      datum,
      stagebedrijf,
      uitvoering,
      ervaring,
      bijgeleerd,
      conclusie,
      score,
      reflectie,
      bijlagen,
    } = req.body;
    const verslag = await Stageverslag.create({
      datum,
      stagebedrijf,
      uitvoering,
      ervaring,
      bijgeleerd,
      conclusie,
      score,
      reflectie,
      bijlagen,
    });
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const dagboek = await Stagedagboek.findOne({
      student: gebruiker._id,
    });
    if (dagboek) dagboek.stageverslag = verslag._id;
    await dagboek?.save();
    res.status(201).json(verslag);
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

export const updateVerslag = async (req: Request, res: Response) => {
  try {
    const { verslagId:id } = req.params;
    const {
      datum,
      stagebedrijf,
      uitvoering,
      ervaring,
      bijgeleerd,
      conclusie,
      score,
      reflectie,
      bijlagen,
    } = req.body;
    const verslag = await Stagedag.findByIdAndUpdate(
      id,
      {
        datum,
        stagebedrijf,
        uitvoering,
        ervaring,
        bijgeleerd,
        conclusie,
        score,
        reflectie,
        bijlagen,
      },
      { new: true }
    );
    res.status(200).json(verslag);
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

export const deleteVerslag = async (req: Request, res: Response) => {
  try {
    // TODO delete files related to this
    const { verslagId:id } = req.params;
    const verslag = await Stageverslag.findByIdAndDelete(id);
    res.status(200).json(verslag);
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
