import { Request, Response } from "express";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/helpers";
import { Gebruiker } from "../models/GebruikerModel";

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
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");
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
    res.status(201).json({message:"Klasgroep aangemaakt",klasgroep});
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const pushStudentToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { studentId } = req.body;

    const klasgroep = await Klasgroep.findById(klasgroepId);
    const student = await Gebruiker.findById(studentId);

    if (!studentId) throw new BadRequestError("StudentId is verplicht");
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");
    if (!student) throw new NotFoundError("Student niet gevonden");

    klasgroep.studenten.push(studentId);
    await klasgroep.save();

    const response = await Klasgroep.populate(klasgroep, [
      {
        path: "vakken",
        select: "_id naam",
      },
      { path: "studenten", select: "-wachtwoord" },
    ]);

    res
      .status(200)
      .json({ message: "Student toegevoegd", klasgroep: response });
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
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    if (!klasgroep.studenten.find((s) => s.id == studentId))
      throw new BadRequestError("Student zit niet in deze klasgroep");

    klasgroep.studenten = klasgroep.studenten.filter(
      (student) => student.id !== studentId
    );
    await klasgroep.save();

    const response = await Klasgroep.populate(klasgroep, [
      {
        path: "vakken",
        select: "_id naam",
      },
      { path: "studenten", select: "-wachtwoord" },
    ]);

    res
      .status(200)
      .json({ message: "Student verwijderd", klasgroep: response });
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

    const response = await Klasgroep.populate(klasgroep, {
      path: "vakken",
      select: "_id naam",
    });

    res.status(200).json({ message: "Vak toegevoegd", klasgroep: response });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const removeVakFromKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { vakId } = req.body;

    if (!vakId) throw new BadRequestError("vakId is verplicht");
    const vak = await Vak.findById(vakId);
    if (!vak) throw new NotFoundError("Vak niet gevonden");

    const klasgroep = await Klasgroep.findByIdAndUpdate(
      klasgroepId,
      {
        $pull: { vakken: vakId },
      },
      { new: true }
    ).populate("vakken", "_id naam");
    await Vak.findByIdAndDelete(vakId);

    res.status(204).json({ message: "Vak verwijderd", klasgroep });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
