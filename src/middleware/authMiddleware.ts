import "dotenv/config";
import { NextFunction, Request, Response } from "../utils/types";
import jwt from "jsonwebtoken";
import { Gebruiker } from "../models/GebruikerModel";
import { Klasgroep } from "../models/KlasgroepModel";
import { Taak } from "../models/TaakModel";
import { Inzending } from "../models/InzendingModel";
import {
  ErrorHandler,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import { Stagedagboek } from "../models/StagedagboekModel";
import { Bijlage } from "../models/BijlageModel";
export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) throw new UnauthorizedError("Geen toegang tot deze pagina");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decodedToken === "string" || !("email" in decodedToken))
      throw new UnauthorizedError("Geen toegang tot deze pagina");

    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) throw new UnauthorizedError("Geen toegang tot deze pagina");

    
    req.gebruiker = gebruiker;
    next();
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const isDocent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    if (!gebruiker || !gebruiker.isDocent)
      throw new UnauthorizedError("Geen toegang tot deze pagina", 403);

    next();
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const {
      klasgroepId,
      taakId,
      inzendingId,
      studentId,
      dagboekId,
      dagId,
      verslagId,
      bijlageId,
    } = req.params;
    if (gebruiker.isDocent) return next();

    if (bijlageId) {
      const bijlage = await Bijlage.findById(bijlageId);
      if (!bijlage) throw new NotFoundError("Bijlage niet gevonden");

      if (bijlage.gebruiker !== gebruiker.id)
        throw new UnauthorizedError("Geen toegang tot deze bijlage", 403);
    }
    if (taakId) {
      const taak = await Taak.findById(taakId).populate("klasgroep");

      if (!taak) throw new NotFoundError("Taak niet gevonden");

      const klasgroep = await Klasgroep.findById(taak.klasgroep);
      if (
        !taak.isGepubliceerd ||
        (klasgroep && !klasgroep.studenten.includes(gebruiker.id))
      )
        throw new UnauthorizedError("Geen toegang tot deze taak", 403);
    }
    if (klasgroepId) {
      const klasgroep = await Klasgroep.findById(klasgroepId);

      if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

      if (!klasgroep.studenten.includes(gebruiker.id))
        throw new UnauthorizedError("Geen toegang tot deze klasgroep", 403);

      if (studentId) {
        if (studentId !== gebruiker.id)
          throw new UnauthorizedError(
            "Geen toegang tot deze gebruikerdata",
            403
          );
      }
    }
    if (inzendingId) {
      const inzending = await Inzending.findById(inzendingId);
      if (!inzending) throw new NotFoundError("Inzending niet gevonden");

      if (inzending.student !== gebruiker.id)
        throw new UnauthorizedError("Geen toegang tot deze inzending", 403);
    }
    if (dagboekId) {
      const dagboek = await Stagedagboek.findOne({
        _id: dagboekId,
        student: gebruiker.id,
      });
      if (!dagboek)
        throw new UnauthorizedError("Geen toegang tot dit stagedagboek", 403);
    }
    if (verslagId) {
      const verslag = await Stagedagboek.findOne({
        verslag: verslagId,
        student: gebruiker.id,
      });
      if (!verslag)
        throw new UnauthorizedError("Geen toegang tot dit stageverslag", 403);
    }
    if (dagId) {
      const dag = await Stagedagboek.findOne({
        dagen: dagId,
        student: gebruiker.id,
      });
      if (!dag)
        throw new UnauthorizedError("Geen toegang tot deze stagedag", 403);
    }
    next();
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
