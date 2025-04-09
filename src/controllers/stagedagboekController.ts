import { Request, Response } from "express";
import { Stagedagboek } from "../models/StagedagboekModel";
import { Stagedag } from "../models/StagedagModel";
import { Stageverslag } from "../models/StageverslagModel";
import { ErrorHandler, NotFoundError } from "../utils/errors";

/*
 * STAGEDAGBOEK
 */
export const getDagboek = async (req: Request, res: Response) => {
  try {
    const { dagboekId: id } = req.params;
    const dagboek = await Stagedagboek.findById(id)
      .lean()
      .populate(["stageverslag", "stagedagen"])
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");
    if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");
    res.status(200).json(dagboek);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getAuthDagboek = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const dagboek = await Stagedagboek.findOne({
      klasgroep: klasgroepId,
      student: gebruiker.id,
    })
      .lean()
      .populate(["stageverslag", "stagedagen"])
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");

    if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");
    res.status(200).json(dagboek);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const createAuthDagboek = async (req: Request, res: Response) => {
  const { klasgroepId } = req.params;
  //@ts-ignore
  const gebruiker = req.gebruiker;
  const dagboek = await Stagedagboek.create({
    klasgroep: klasgroepId,
    student: gebruiker.id,
    stageverslag: null,
    stagedagen: [],
  });
  res.status(201).json({ message: "Dagboek aangemaakt", dagboek });
};

export const deleteDagboek = async (req: Request, res: Response) => {
  const { dagboekId } = req.params;
  const dagboek = await Stagedagboek.findByIdAndDelete(dagboekId);
  if (!dagboek) throw new NotFoundError("Verslag niet gevonden");
  const verslag = await Stageverslag.findByIdAndDelete(
    dagboek.stageverslag?.toString()
  );
  for (let dag of dagboek.stagedagen) {
    await Stagedag.findByIdAndDelete(dag?.toString());
  }

  res.status(200).json({ message: "Dagboek verwijderd", dagboek });
};

/*
 * STAGEDAGEN
 */
export const getDag = async (req: Request, res: Response) => {
  try {
    const { dagId: id } = req.params;
    const dag = await Stagedag.findById(id);
    if (!dag) throw new NotFoundError("Dag niet gevonden");
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
      datum: datum || Date.now(),
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
    })
      .populate("stageverslag")
      .populate("stagedagen")
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");
    dagboek?.stagedagen.push(dag._id);
    await dagboek?.save();
    res.status(201).json({ message: "Dag toegevoegd", dag, dagboek });
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
    if (!dag) throw new NotFoundError("Dag niet gevonden");

    const dagboek = await Stagedagboek.findOne({
      stagedagen: id,
    })
      .populate("stageverslag")
      .populate("stagedagen")
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");

    res.status(200).json({ message: "Dag bijgewerkt", dag, dagboek });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteDag = async (req: Request, res: Response) => {
  try {
    // TODO delete files related to this
    const { dagId: id } = req.params;
    const dag = await Stagedag.findByIdAndDelete(id);
    if (!dag) throw new NotFoundError("Dag niet gevonden");

    const dagboek = await Stagedagboek.findOneAndUpdate(
      {
        stagedagen: id,
      },
      { $pull: { stagedagen: id } },
      { new: true }
    )
      .populate("stageverslag")
      .populate("stagedagen")
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");

    res.status(200).json({ message: "Dag verwijderd", dag, dagboek });
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
    if (!verslag) throw new NotFoundError("Verslag niet gevonden");
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
      datum: datum || Date.now(),
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
    })
      .populate("stageverslag")
      .populate("stagedagen")
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");
    if (dagboek) dagboek.stageverslag = verslag._id;
    await dagboek?.save();
    res.status(201).json({ message: "Verslag toegevoegd", verslag, dagboek });
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

    if (!verslag) throw new NotFoundError("Verslag niet gevonden");
    const dagboek = await Stagedagboek.findOne({
      stageverslag: id,
    })
      .populate("stageverslag")
      .populate("stagedagen")
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");
    res.status(200).json({ verslag, dagboek });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteVerslag = async (req: Request, res: Response) => {
  try {
    // TODO delete files related to this
    const { verslagId: id } = req.params;

    const verslag = await Stageverslag.findByIdAndDelete(id);
    if (!verslag) throw new NotFoundError("Verslag niet gevonden");
    const dagboek = await Stagedagboek.findOneAndUpdate(
      {
        stageverslag: id,
      },
      { stageverslag: null },
      { new: true }
    )
      .populate("stageverslag")
      .populate("stagedagen")
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");
    res.status(200).json({ message: "Verslag verwijderd", verslag, dagboek });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
