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
    // Check of token bestaat in cookies / headers
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Check of token juist is
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decodedToken === "string" || !("email" in decodedToken))
      throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Check of gebruiker uit token bestaat
    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Stop gebruiker in de request zodat de applicatie het kan gebruiken
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
    // Check of gebruiker een docent is
    const gebruiker = req.gebruiker;
    if (!gebruiker || !gebruiker.isDocent)
      throw new UnauthorizedError("Geen toegang tot deze pagina", 403);

    next();
  } catch (error: unknown) {
    console.log(req);
    ErrorHandler(error, req, res);
  }
};

export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
    // Als gebruiker een docent is, heeft deze standaard tot alles toegang
    if (gebruiker.isDocent) return next();

    /**
     * hasAccess -> Bijlagen
     */
    if (bijlageId) {
      // Check of bijlage bestaat
      const bijlage = await Bijlage.findById(bijlageId);
      if (!bijlage) throw new NotFoundError("Bijlage niet gevonden");

      // Check of gebruiker toegang heeft tot bijlage
      if (bijlage.gebruiker !== gebruiker.id)
        throw new UnauthorizedError("Geen toegang tot deze bijlage", 403);
    }
    if (taakId) {
      // Check of taak bestaat
      const taak = await Taak.findById(taakId).populate("klasgroep");
      if (!taak) throw new NotFoundError("Taak niet gevonden");

      // Check of gebruiker toegang heeft tot taak
      const klasgroep = await Klasgroep.findById(taak.klasgroep);
      if (
        !taak.isGepubliceerd ||
        (klasgroep && !klasgroep.studenten.includes(gebruiker.id))
      )
        throw new UnauthorizedError("Geen toegang tot deze taak", 403);
    }

    /**
     *  hasAccess -> Klasgroepen / Gebruikers
     */
    if (klasgroepId) {
      // Check of klasgroep bestaat
      const klasgroep = await Klasgroep.findById(klasgroepId);
      if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

      // Check of gebruiker toegang heeft tot klasgroep
      if (!klasgroep.studenten.includes(gebruiker.id))
        throw new UnauthorizedError("Geen toegang tot deze klasgroep", 403);

      // Gebruiker heeft enkel toegang tot eigen data
      if (studentId) {
        if (studentId !== gebruiker.id)
          throw new UnauthorizedError(
            "Geen toegang tot deze gebruikerdata",
            403
          );
      }
    }

    /**
     * hasAccess -> Inzendingen
     */
    if (inzendingId) {
      // Check of inzending bestaat
      const inzending = await Inzending.findById(inzendingId);
      if (!inzending) throw new NotFoundError("Inzending niet gevonden");

      // Gebruiker heeft enkel toegang tot eigen inzendingen
      if (inzending.student !== gebruiker.id)
        throw new UnauthorizedError("Geen toegang tot deze inzending", 403);
    }

    /**
     * hasAccess -> Stagedagboeken, -verslagen, -dagen
     */
    if (dagboekId) {
      // Check of dagboek bestaat en van gebruiker is
      const dagboek = await Stagedagboek.findOne({
        _id: dagboekId,
        student: gebruiker.id,
      });
      if (!dagboek)
        throw new UnauthorizedError("Geen toegang tot dit stagedagboek", 403);
    }
    if (verslagId) {
      // Check of gebruiker toegang heeft tot het stagedagboek waarin dit verslag staat
      const verslag = await Stagedagboek.findOne({
        stageverslag: verslagId,
        student: gebruiker.id,
      });
      if (!verslag)
        throw new UnauthorizedError("Geen toegang tot dit stageverslag", 403);
    }
    if (dagId) {
      // Check of gebruiker toegang heeft tot het stagedagboek waarin deze dag staat
      const dag = await Stagedagboek.findOne({
        stagedagen: dagId,
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
