import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Gebruiker } from "../models/GebruikerModel";
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
