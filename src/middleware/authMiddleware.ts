import "dotenv/config";
import { NextFunction, Request, Response } from "express";
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

    //@ts-ignore
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
    const { klasgroepId, taakId, inzendingId, studentId } = req.params;
    if (gebruiker.isDocent) return next();

    
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

      if(studentId){
        if(studentId !== gebruiker.id)
          throw new UnauthorizedError("Geen toegang tot deze gebruikerdata", 403);
      }
    }
    if (inzendingId) {
      const inzending = await Inzending.findById(inzendingId);
      if (!inzending) throw new NotFoundError("Inzending niet gevonden");

      if (inzending.student !== gebruiker.id)
        throw new UnauthorizedError("Geen toegang tot deze inzending", 403);
    }
    next();
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
