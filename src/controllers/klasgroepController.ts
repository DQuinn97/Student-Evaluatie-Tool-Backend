import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import {
  BadRequestError,
  ErrorHandler,
  UnauthorizedError,
} from "../utils/helpers";
const { ValidationError } = MongooseError;

export const getKlasgroepen = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const klasgroepen = await Klasgroep.find({ studenten: gebruiker.id });
    res.status(200).json(klasgroepen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const klasgroep = await Klasgroep.findById(klasgroepId)
      .populate("studenten", "-wachtwoord")
      .populate("vakken", "_id naam");
    if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");
    res.status(200).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addKlasgroep = async (req: Request, res: Response) => {
  try {
    const { naam, beginjaar, eindjaar } = req.body;
    if (!naam || !beginjaar || !eindjaar) {
      throw new BadRequestError("Naam, beginjaar en eindjaar zijn verplicht");
    }
    const klasgroep = await Klasgroep.create({ naam, beginjaar, eindjaar });
    res.status(201).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const pushStudentToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { studentId } = req.body;

    const klasgroep = await Klasgroep.findById(klasgroepId);

    if (!studentId) throw new BadRequestError("StudentId is verplicht");
    if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");

    klasgroep.studenten.push(studentId);
    await klasgroep.save();

    res.status(200).json(
      await Klasgroep.populate(klasgroep, [
        {
          path: "vakken",
          select: "_id naam",
        },
        { path: "studenten", select: "-wachtwoord" },
      ])
    );
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const removeStudentFromKlasgroep = async (
  req: Request,
  res: Response
) => {
  try {
    const { klasgroepId } = req.params;
    const { studentId } = req.body;

    const klasgroep = await Klasgroep.findById(klasgroepId).populate(
      "studenten",
      "-wachtwoord"
    );

    if (!studentId) throw new BadRequestError("studentId is verplicht");
    if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");

    if (!klasgroep.studenten.find((s) => s.id == studentId)) {
      throw new Error("Student zit niet in deze klasgroep");
    }

    klasgroep.studenten = klasgroep.studenten.filter(
      (student) => student.id !== studentId
    );
    await klasgroep.save();

    res.status(200).json(
      await Klasgroep.populate(klasgroep, [
        {
          path: "vakken",
          select: "_id naam",
        },
        { path: "studenten", select: "-wachtwoord" },
      ])
    );
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const pushVakToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { naam } = req.body;

    const klasgroep = await Klasgroep.findById(klasgroepId).populate("vakken");

    if (!naam) throw new BadRequestError("naam is verplicht");
    if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");

    const vak = await Vak.create({ naam });
    klasgroep.vakken.push(vak._id);
    await klasgroep.save();

    res.status(200).json(
      await Klasgroep.populate(klasgroep, {
        path: "vakken",
        select: "_id naam",
      })
    );
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const removeVakFromKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { vakId } = req.body;

    if (!vakId) throw new BadRequestError("vakId is verplicht");

    await Klasgroep.findByIdAndUpdate(klasgroepId, {
      $pull: { vakken: vakId },
    });
    await Vak.findByIdAndDelete(vakId);

    res.status(204).json({ message: "Vak verwijderd" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
