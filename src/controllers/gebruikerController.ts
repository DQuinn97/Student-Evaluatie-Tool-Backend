import "dotenv/config";
import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { Gebruiker } from "../models/GebruikerModel";

export const getGebruikerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gebruiker = await Gebruiker.findById(id).select("-wachtwoord");
    res.status(200).json(gebruiker);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const getAuthGebruiker = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    if (!gebruiker) {
      res.status(400).json({ message: "Onbekende gebruiker" });
      return;
    }
    res.status(200).json(gebruiker);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const setGebruikerData = async (req: Request, res: Response) => {
  try {
    const { naam, achternaam, gsm } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    if (!gebruiker) {
      res.status(400).json({ message: "Onbekende gebruiker" });
      return;
    }

    if (naam) gebruiker.naam = naam;
    if (achternaam) gebruiker.achternaam = achternaam;
    if (gsm) gebruiker.tel = gsm;
    await gebruiker.save();

    res.status(200).json({ message: "Gebruiker data aangepast" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const setGebruikerFoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    //@ts-ignore
    const gebruiker = req.gebruiker;

    if (!gebruiker) {
      res.status(400).json({ message: "Onbekende gebruiker" });
      return;
    }

    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
    const transform = "c_thumb,g_center,h_200,w_200/r_max/f_auto/";
    const imageUrl = req.file.filename;

    gebruiker.foto = `${baseUrl}${transform}${imageUrl}`;
    await gebruiker.save();

    res.status(200).json({ message: "Gebruiker foto aangepast" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
