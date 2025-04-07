import { Request, Response } from "express";
import { Stagedagboek } from "../models/StagedagboekModel";
import { Stagedag } from "../models/StagedagModel";
import { Stageverslag } from "../models/StageverslagModel";
import { BadRequestError, ErrorHandler } from "../utils/helpers";

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
    if (!dagboek) throw new BadRequestError("Dagboek niet gevonden");
    res.status(200).json(dagboek);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

/*
 * STAGEDAGEN
 */
export const getDag = async (req: Request, res: Response) => {
  try {
    const { dagId: id } = req.params;
    const dag = await Stagedag.findById(id);
    if (!dag) throw new BadRequestError("Dag niet gevonden");
    res.status(200).json(dag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
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
    ErrorHandler(error, req, res);
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
    ErrorHandler(error, req, res);
  }
};

export const deleteDag = async (req: Request, res: Response) => {
  try {
    // TODO delete files related to this
    const { dagId: id } = req.params;
    const dag = await Stagedag.findByIdAndDelete(id);
    res.status(200).json(dag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
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
    ErrorHandler(error, req, res);
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
    ErrorHandler(error, req, res);
  }
};

export const updateVerslag = async (req: Request, res: Response) => {
  try {
    const { verslagId: id } = req.params;
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
    if (!verslag) throw new BadRequestError("Verslag niet gevonden");
    res.status(200).json(verslag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteVerslag = async (req: Request, res: Response) => {
  try {
    // TODO delete files related to this
    const { verslagId: id } = req.params;
    const verslag = await Stageverslag.findByIdAndDelete(id);
    if (!verslag) throw new BadRequestError("Verslag niet gevonden");
    res.status(200).json(verslag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
