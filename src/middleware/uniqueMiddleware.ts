import { NextFunction, Request, Response } from "express";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import { Inzending } from "../models/InzendingModel";
import { Taak } from "../models/TaakModel";
import {
  BadRequestError,
  ErrorHandler,
  UnauthorizedError,
} from "../utils/helpers";

export const isUnique = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taakId, klasgroepId } = req.params;
    const { naam: vak, studentId } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    if (klasgroepId) {
      const klasgroep = await Klasgroep.findById(klasgroepId).populate(
        "vakken"
      );
      if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");

      if (studentId && klasgroep.studenten.find((s) => s.id == studentId))
        throw new BadRequestError(
          "Student is al toegevoegd aan deze klasgroep",
          409
        );

      if (
        vak &&
        (await Vak.findOne({
          naam: vak,
          _id: { $in: klasgroep.vakken },
        }))
      )
        throw new BadRequestError(
          "Vak met deze naam bestaat al in deze klasgroep",
          409
        );
    }
    if (taakId) {
      const taak = await Taak.findById(taakId).populate("inzendingen");
      if (!taak) throw new BadRequestError("Taak niet gevonden");

      if (
        await Inzending.findOne({
          student: gebruiker._id,
          _id: { $in: taak.inzendingen },
        })
      )
        throw new BadRequestError(
          "Student heeft al een inzending op deze taak verstuurd",
          409
        );
    }

    next();
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
