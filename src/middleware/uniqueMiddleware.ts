import { NextFunction, Request, Response } from "../utils/types";
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

    const gebruiker = req.gebruiker;

    /**
     * isUnique -> Klasgroep: Student, vak en stagedagboek per student
     */
    if (klasgroepId) {
      // Check of klasgroep bestaat
      const klasgroep = await Klasgroep.findById(klasgroepId).populate(
        "vakken"
      );
      if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

      // Check of student al in klasgroep zit
      if (studentId && klasgroep.studenten.find((s) => s.id == studentId))
        throw new BadRequestError(
          "Student is al toegevoegd aan deze klasgroep",
          409
        );

      // Check of vak al in klasgroep zit
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

      // Check of student al een stagedagboek heeft in deze klasgroep
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
    /**
     * isUnique -> Stageverslag
     */
    if (dagboekId) {
      // Check of dagboek bestaat
      const dagboek = await Stagedagboek.findById(dagboekId);
      if (!dagboek) throw new NotFoundError("Dagboek niet gevonden");
      // Check of dagboek al een verslag heeft
      if (dagboek.stageverslag)
        throw new BadRequestError("Dagboek heeft al een verslag", 409);
    }
    /**
     * isUnique -> Inzending
     */
    if (taakId) {
      // Check of taak bestaat
      const taak = await Taak.findById(taakId).populate("inzendingen");
      if (!taak) throw new NotFoundError("Taak niet gevonden");

      // Check of student al een inzending op deze taak heeft gemaakt
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
