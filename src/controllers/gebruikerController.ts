import "dotenv/config";
import { Request, Response } from "express";
import { Gebruiker } from "../models/GebruikerModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/helpers";

export const getGebruikerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gebruiker = await Gebruiker.findById(id).select("-wachtwoord");
    if (!gebruiker) throw new NotFoundError("Gebruiker niet gevonden");
    res.status(200).json(gebruiker);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const getAuthGebruiker = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const response = { ...gebruiker.toJSON(), wachtwoord: undefined };

    res.status(200).json({ gebruiker: response });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const setGebruikerData = async (req: Request, res: Response) => {
  try {
    const { naam, achternaam, gsm } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    if (naam) gebruiker.naam = naam;
    if (achternaam) gebruiker.achternaam = achternaam;
    if (gsm) gebruiker.gsm = gsm;

    await gebruiker.save();

    const response = { ...gebruiker.toJSON(), wachtwoord: undefined };

    res
      .status(200)
      .json({ message: "Gebruiker data aangepast", gebruiker: response });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const setGebruikerFoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new BadRequestError("No file uploaded", 415);
    }
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
    const transform = "c_thumb,g_center,h_200,w_200/r_max/f_auto/";
    const imageUrl = req.file.filename;

    gebruiker.foto = `${baseUrl}${transform}${imageUrl}`;
    await gebruiker.save();

    const response = { ...gebruiker.toJSON(), wachtwoord: undefined };

    res
      .status(201)
      .json({ message: "Gebruiker foto aangepast", gebruiker: response });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
