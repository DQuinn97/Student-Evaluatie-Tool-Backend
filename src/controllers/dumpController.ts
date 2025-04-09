import "dotenv/config";
import { Request, Response } from "express";
import { ErrorHandler, NotFoundError } from "../utils/errors";
import { gebruikerDump, klasgroepDump } from "../utils/dumphelper";
export const getGebruikerDump = async (req: Request, res: Response) => {
  try {
    const { klasgroepId, studentId } = req.params;
    const gebruiker = await gebruikerDump(klasgroepId, studentId);
    if (!gebruiker) throw new NotFoundError("Gebruiker niet gevonden");

    res.status(200).json(gebruiker);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getKlasgroepDump = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const klasgroep = await klasgroepDump(klasgroepId);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    res.status(200).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
