import { NextFunction, Request, Response } from "express";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import { Inzending } from "../models/InzendingModel";
import { Taak } from "../models/TaakModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";
import { Stagedagboek } from "../models/StagedagboekModel";

export const isUnique = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taakId, klasgroepId, dagboekId } = req.params;
    const { naam: vak, studentId } = req.body;
    //@ts-ignore
    const gebruiker = req.gebruiker;

    if (klasgroepId) {
      const klasgroep = await Klasgroep.findById(klasgroepId).populate(
        "vakken"
      );
      if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

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
      if (!vak && !studentId) {
        const dagboek = await Stagedagboek.findOne({
          klasgroep: klasgroepId,
          student: gebruiker.id,
        });
        if (dagboek)
          throw new BadRequestError(
            "Stagedagboek bestaat al op deze klasgroep voor deze gebruiker",
            409
          );
      }
    }
    if (dagboekId) {
      const dagboek = await Stagedagboek.findById(dagboekId);
      if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");
      if (dagboek.stageverslag)
        throw new BadRequestError("Dagboek heeft al een verslag", 409);
    }
    if (taakId) {
      const taak = await Taak.findById(taakId).populate("inzendingen");
      if (!taak) throw new NotFoundError("Taak niet gevonden");

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
