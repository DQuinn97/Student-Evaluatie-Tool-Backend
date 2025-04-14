import { Request, Response } from "../utils/types";
import { Stagedagboek } from "../models/StagedagboekModel";
import { Stagedag } from "../models/StagedagModel";
import { Stageverslag } from "../models/StageverslagModel";
import { ErrorHandler, NotFoundError } from "../utils/errors";
import {
  checkCleanupBijlagen,
  cleanupBijlagen,
  uploadBijlagen,
} from "./bijlageController";

/*
 * STAGEDAGBOEK functies
 */
export const getDagboek = async (req: Request, res: Response) => {
  try {
    // Check of dagboek bestaat
    const { dagboekId: id } = req.params;
    const dagboek = await Stagedagboek.findById(id)
      .lean()
      .populate(["stageverslag", "stagedagen"])
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");
    if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");

    // Success response met dagboek; 200 - OK
    res.status(200).json(dagboek);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getAuthDagboek = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const gebruiker = req.gebruiker;

    // Check of dagboek bestaat voor deze gebruiker in deze klasgroep
    const dagboek = await Stagedagboek.findOne({
      klasgroep: klasgroepId,
      student: gebruiker.id,
    })
      .lean()
      .populate(["stageverslag", "stagedagen"])
      .populate("klasgroep", "_id naam beginjaar eindjaar")
      .populate("student", "-wachtwoord");

    if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");

    // Success response met dagboek; 200 - OK
    res.status(200).json(dagboek);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const createAuthDagboek = async (req: Request, res: Response) => {
  const { klasgroepId } = req.params;
  const gebruiker = req.gebruiker;

  // Maak een blanco dagboek aan voor de ingelogde gebruiker in deze klasgroep
  const dagboek = await Stagedagboek.create({
    klasgroep: klasgroepId,
    student: gebruiker.id,
    stageverslag: null,
    stagedagen: [],
  });

  // Success response met dagboek; 201 - Created
  res.status(201).json(dagboek);
};

export const deleteDagboek = async (req: Request, res: Response) => {
  // Check of dagboek bestaat
  const { dagboekId } = req.params;
  const dagboek = await Stagedagboek.findByIdAndDelete(dagboekId);
  if (!dagboek) throw new NotFoundError("Verslag niet gevonden");

  // Verwijder verslag van dagboek en verwijder bijlagen van verslag
  let verslag = await Stageverslag.findByIdAndDelete(
    dagboek.stageverslag?.toString()
  );
  if (verslag) await cleanupBijlagen(verslag.bijlagen);

  // Loop door de dagen van het dagboek
  for (let dag of dagboek.stagedagen) {
    // Verwijder de stagedag van dagboek en verwijder bijlagen van stagedag
    let dag_ = await Stagedag.findByIdAndDelete(dag?.toString());
    if (dag_) await cleanupBijlagen(dag_.bijlagen);
  }

  // Success response met verwijderde dagboek; 204 - No Content
  res.status(204).json(dagboek);
};

/*
 * STAGEDAGEN functies
 */
export const getDag = async (req: Request, res: Response) => {
  try {
    // Check of stagedag bestaat
    const { dagId: id } = req.params;
    const dag = await Stagedag.findById(id);
    if (!dag) throw new NotFoundError("Dag niet gevonden");

    // Success response met stagedag; 200 - OK
    res.status(200).json(dag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const addDag = async (req: Request, res: Response) => {
  try {
    const { dagboekId } = req.params;
    const {
      datum,
      voormiddag,
      namiddag,
      tools,
      resultaat,
      bijlagen,
      file_uploads,
    } = req.body;

    const gebruiker = req.gebruiker;

    // Check of stagedagboek bestaat
    const dagboek = await Stagedagboek.findById(dagboekId);
    if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");

    // Voeg bijlagen toe aan db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Maak nieuwe stagedag aan
    const dag = await Stagedag.create({
      datum: datum || Date.now(),
      voormiddag,
      namiddag,
      tools,
      resultaat,
      bijlagen,
    });

    // Voeg stagedag toe aan dagboek
    dagboek.stagedagen.push(dag._id);
    await dagboek.save();

    // Success response met dag; 201 - Created
    res.status(201).json(dag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const updateDag = async (req: Request, res: Response) => {
  try {
    const { dagId: id } = req.params;
    const { voormiddag, namiddag, tools, resultaat, bijlagen, file_uploads } =
      req.body;

    const gebruiker = req.gebruiker;

    // Check of de stagedag bestaat
    const dag = await Stagedag.findById(id);
    if (!dag) throw new NotFoundError("Dag niet gevonden");

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Wijzig de stagedag
    const updated = await Stagedag.findByIdAndUpdate(
      id,
      {
        datum: dag.datum,
        voormiddag,
        namiddag,
        tools,
        resultaat,
        bijlagen,
      },
      { new: true }
    );
    if (!updated) throw new NotFoundError("Dag niet gevonden");

    // Check of bijlagen verwijderd mogen wordeng
    await cleanupBijlagen(
      await checkCleanupBijlagen(dag.bijlagen, updated.bijlagen)
    );

    // Success response met stagedag; 200 - OK
    res.status(200).json(updated);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteDag = async (req: Request, res: Response) => {
  try {
    // Check of stagedag bestaat
    const { dagId: id } = req.params;
    const dag = await Stagedag.findByIdAndDelete(id);
    if (!dag) throw new NotFoundError("Dag niet gevonden");

    // Verwijder de stagedag van dagboek en verwijder bijlagen van stagedag
    const dagboek = await Stagedagboek.findOneAndUpdate(
      {
        stagedagen: id,
      },
      { $pull: { stagedagen: id } }
    );
    await cleanupBijlagen(dag.bijlagen);

    // Success response met verwijderde dag; 204 - No Content
    res.status(204).json(dag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

/*
 * STAGEVERSLAG functies
 */
export const getVerslag = async (req: Request, res: Response) => {
  try {
    // Check of stageverslag bestaat
    const { verslagId: id } = req.params;
    const verslag = await Stageverslag.findById(id);
    if (!verslag) throw new NotFoundError("Verslag niet gevonden");

    // Success response met stageverslag; 200 - OK
    res.status(200).json(verslag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const addVerslag = async (req: Request, res: Response) => {
  try {
    const { dagboekId } = req.params;
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
      file_uploads,
    } = req.body;

    const gebruiker = req.gebruiker;

    // Check of stagedagboek bestaat
    const dagboek = await Stagedagboek.findById(dagboekId);
    if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Maak nieuw stageverslag aan
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

    // Voeg stageverslag aan stagedagboek toe
    if (dagboek) dagboek.stageverslag = verslag._id;
    await dagboek?.save();

    // Success response met verslag; 201 - Created
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
      file_uploads,
    } = req.body;
    const gebruiker = req.gebruiker;

    // Check of stageverslag bestaat
    const verslag = await Stageverslag.findById(id);
    if (!verslag) throw new NotFoundError("Verslag niet gevonden");

    // Voeg bijlagen toe in db
    if (file_uploads && file_uploads.length > 0) {
      const nieuweBijlagen = await uploadBijlagen(file_uploads, gebruiker);
      bijlagen.push(...nieuweBijlagen);
    }

    // Wijzig het stageverslag
    const updated = await Stageverslag.findByIdAndUpdate(
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
    if (!updated) throw new NotFoundError("Verslag niet gevonden");

    // Check of bijlagen verwijderd mogen worden
    await cleanupBijlagen(
      await checkCleanupBijlagen(verslag.bijlagen, updated.bijlagen)
    );

    // Success response met stageverslag; 200 - OK
    res.status(200).json(updated);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const deleteVerslag = async (req: Request, res: Response) => {
  try {
    // Check of stageverslag bestaat
    const { verslagId: id } = req.params;
    const verslag = await Stageverslag.findByIdAndDelete(id);
    if (!verslag) throw new NotFoundError("Verslag niet gevonden");

    // Verwijder stageverslag uit stagedagboek en verwijder bijlagen van stageverslag
    await Stagedagboek.findOneAndUpdate(
      {
        stageverslag: id,
      },
      { stageverslag: null }
    );
    await cleanupBijlagen(verslag.bijlagen);

    // Success response met verwijderd stageverslag; 204 - No content
    res.status(204).json(verslag);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
