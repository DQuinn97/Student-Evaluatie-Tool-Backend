import "dotenv/config";
import { Request, Response } from "../utils/types";
import { Gebruiker } from "../models/GebruikerModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";
import { UploadApiResponse } from "cloudinary";

export const getGebruikers = async (req: Request, res: Response) => {
  try {
    // Haal alle gebruikers op
    const gebruikers = await Gebruiker.find().select("-wachtwoord");
    console.log(gebruikers);

    // Success response met gebruikers; 200 - OK
    res.status(200).json(gebruikers);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const getGebruikerById = async (req: Request, res: Response) => {
  try {
    // Check of gebruiker bestaat
    const { gebruikerId: id } = req.params;
    const gebruiker = await Gebruiker.findById(id).select("-wachtwoord");
    if (!gebruiker) throw new NotFoundError("Gebruiker niet gevonden");

    // Success response met gebruiker; 200 - OK
    res.status(200).json(gebruiker);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const getAuthGebruiker = async (req: Request, res: Response) => {
  try {
    // Transformeer de huidig ingelogde gebruiker data
    const gebruiker = req.gebruiker;
    const response = { ...gebruiker.toJSON(), wachtwoord: undefined };

    // Success response met gebruiker; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const setGebruikerData = async (req: Request, res: Response) => {
  try {
    const { naam, achternaam, gsm } = req.body;
    const gebruiker = req.gebruiker;

    // Update gebruikers gegevens
    if (naam) gebruiker.naam = naam;
    if (achternaam) gebruiker.achternaam = achternaam;
    if (gsm) gebruiker.gsm = gsm;

    await gebruiker.save();

    // Transformeer de huidig ingelogde gebruiker data
    const response = { ...gebruiker.toJSON(), wachtwoord: undefined };

    // Success response met gebruiker; 200 - OK
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const setGebruikerFoto = async (req: Request, res: Response) => {
  try {
    // Check of er een foto is meegegeven
    const { foto_upload }: { foto_upload: UploadApiResponse } = req.body;
    if (!foto_upload) throw new BadRequestError("Geen foto geupload", 415);

    const gebruiker = req.gebruiker;

    // Genereer de te terug te geven url
    const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
    const transform = "c_thumb,g_center,h_200,w_200/r_max/f_auto/";
    const imageUrl = foto_upload.public_id;

    // Sla de url op in de gebruiker in de db
    gebruiker.foto = `${baseUrl}${transform}${imageUrl}`;
    await gebruiker.save();

    // Transformeer de huidig ingelogde gebruiker data
    const response = { ...gebruiker.toJSON(), wachtwoord: undefined };

    // Success response met gebruiker; 201 - Created
    res.status(201).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
