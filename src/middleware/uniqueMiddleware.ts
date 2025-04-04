import { NextFunction, Request, Response } from "express";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import { Inzending } from "../models/InzendingModel";
import { Taak } from "../models/TaakModel";

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
      console.log("test");
      const klasgroep = await Klasgroep.findById(klasgroepId).populate(
        "vakken"
      );
      console.log(klasgroep);
      if (!klasgroep) {
        throw new Error("Klasgroep niet gevonden");
      }
      if (studentId && klasgroep.studenten.find((s) => s.id == studentId)) {
        throw new Error("Student is al toegevoegd aan deze klasgroep");
      }
      if (
        vak &&
        (await Vak.findOne({
          naam: vak,
          _id: { $in: klasgroep.vakken },
        }))
      ) {
        throw new Error("Vak met deze naam bestaat al in deze klasgroep");
      }
    }
    if (taakId) {
      const taak = await Taak.findById(taakId).populate("inzendingen");
      if (!taak) {
        throw new Error("Taak niet gevonden");
      }
      if (
        await Inzending.findOne({
          student: gebruiker._id,
          _id: { $in: taak.inzendingen },
        })
      ) {
        throw new Error(
          "Student heeft al een inzending op deze taak verstuurd"
        );
      }
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
