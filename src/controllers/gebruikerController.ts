import "dotenv/config";
import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { Gebruiker } from "../models/GebruikerModel";
import jwt from "jsonwebtoken";

export const setGebruikerData = async (req: Request, res: Response) => {
  try {
    const { naam, achternaam, gsm, gebruiker } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error("Internal server error");
    }

    if (!gebruiker) {
      res.status(400).json({ message: "Onbekende gebruiker" });
      return;
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof decodedToken === "string" || !("email" in decodedToken)) {
      res.status(400).json({ message: "Foutieve reset link." });
      return;
    }
    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) {
      res.status(400).json({ message: "Geen herkende gebruiker" });
      return;
    }

    if (naam) gebruiker.naam = naam;
    if (achternaam) gebruiker.achternaam = achternaam;
    if (gsm) gebruiker.tel = gsm;
    await gebruiker.save();

    res.status(200).json({ message: "Wachtwoord reset aanvraag verstuurd" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
