import "dotenv/config";
import { Request, Response } from "../utils/types";
import { ErrorHandler, NotFoundError } from "../utils/errors";
import { gebruikerDump, klasgroepDump } from "../utils/dumphelper";
export const getGebruikerDump = async (req: Request, res: Response) => {
  try {
    // Check of gebruiker bestaat en genereer de dump
    const { klasgroepId, studentId } = req.params;
    const gebruiker = await gebruikerDump(klasgroepId, studentId);
    if (!gebruiker) throw new NotFoundError("Gebruiker niet gevonden");

    // Success response met dump; 200 - OK
    res.status(200).json(gebruiker);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getKlasgroepDump = async (req: Request, res: Response) => {
  try {
    // Check of klasgroep bestaat en genereer de dump
    const { klasgroepId } = req.params;
    const klasgroep = await klasgroepDump(klasgroepId);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Success response met dump; 200 - OK
    res.status(200).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
