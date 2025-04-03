import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Gebruiker } from "../models/GebruikerModel";
import { Klasgroep } from "../models/KlasgroepModel";
import { Taak } from "../models/TaakModel";
export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decodedToken === "string" || !("email" in decodedToken)) {
      res.status(400).json({ message: "Foutieve token" });
      return;
    }
    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) {
      res.status(400).json({ message: "Geen herkende gebruiker" });
      return;
    }
    //@ts-ignore
    req.gebruiker = gebruiker;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
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
    if (!gebruiker) {
      res.status(400).json({ message: "Geen herkende gebruiker" });
      return;
    }
    if (!gebruiker.isDocent) {
      res.status(400).json({ message: "Geen herkende docent" });
      return;
    }

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
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
    const { klasgroepId, taakId } = req.params;
    if (gebruiker.isDocent) return next();

    if (taakId) {
      const taak = await Taak.findById(taakId).populate("klasgroep");

      if (!taak) {
        res.status(400).json({ message: "Geen herkende taak" });
        return;
      }
      const klasgroep = await Klasgroep.findById(taak.klasgroep);
      if (
        !taak.isGepubliceerd ||
        (klasgroep && !klasgroep.studenten.includes(gebruiker.id))
      ) {
        res.status(400).json({ message: "Geen toegang tot deze taak" });
        return;
      }
    }
    if (klasgroepId) {
      const klasgroep = await Klasgroep.findById(klasgroepId);

      if (!klasgroep) {
        res.status(400).json({ message: "Geen herkende klasgroep" });
        return;
      }
      if (!klasgroep.studenten.includes(gebruiker.id)) {
        res.status(400).json({ message: "Geen toegang tot deze klasgroep" });
        return;
      }
    }
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
