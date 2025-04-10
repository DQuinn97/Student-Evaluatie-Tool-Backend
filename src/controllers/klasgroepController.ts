import { Request, Response } from "express";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";
import { vakPath2 as vakPath } from "../utils/helpers";
import { Gebruiker } from "../models/GebruikerModel";

export const getKlasgroepen = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const klasgroepen = !gebruiker.isDocent
      ? await Klasgroep.find({
          studenten: gebruiker.id,
        })
          .select("-studenten")
          .populate(vakPath)
      : await Klasgroep.find().populate([
          { path: "studenten", select: "-wachtwoord" },
          vakPath,
        ]);
    res.status(200).json(klasgroepen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

// export const getAlleKlasgroepen = async (req: Request, res: Response) => {
//   try {
//     const klasgroepen = await Klasgroep.find().populate([
//       { path: "studenten", select: "-wachtwoord" },
//       vakPath,
//     ]);
//     res.status(200).json(klasgroepen);
//   } catch (error: unknown) {
//     ErrorHandler(error, req, res);
//   }
// };

export const getKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const klasgroep = await Klasgroep.findById(klasgroepId)
      .populate([{ path: "studenten", select: "-wachtwoord" }, vakPath])
      .select(gebruiker.isDocent ? "*" : "-studenten");

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
    const student = await Gebruiker.findById(studentId);

    if (!studentId) throw new BadRequestError("StudentId is verplicht");
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");
    if (!student) throw new NotFoundError("Student niet gevonden");

    klasgroep.studenten.push(studentId);
    await klasgroep.save();

    const response = await Klasgroep.populate(klasgroep, [
      vakPath,
      { path: "studenten", select: "-wachtwoord" },
    ]);

    res.status(200).json(response);
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

    const klasgroep = await Klasgroep.findById(klasgroepId).populate([
      { path: "studenten", select: "-wachtwoord" },
      vakPath,
    ]);

    if (!studentId) throw new BadRequestError("studentId is verplicht");
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    if (!klasgroep.studenten.find((s) => s.id == studentId))
      throw new BadRequestError("Student zit niet in deze klasgroep");

    klasgroep.studenten = klasgroep.studenten.filter(
      (student) => student.id !== studentId
    );
    await klasgroep.save();

    const response = await Klasgroep.populate(klasgroep, [
      vakPath,
      { path: "studenten", select: "-wachtwoord" },
    ]);

    res.status(204).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const pushVakToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { naam } = req.body;

    const klasgroep = await Klasgroep.findById(klasgroepId).populate(vakPath);

    if (!naam) throw new BadRequestError("naam is verplicht");
    if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");

    const vak = await Vak.create({ naam });
    klasgroep.vakken.push(vak._id);
    await klasgroep.save();

    const response = await Klasgroep.populate(klasgroep, {
      path: "vakken",
      select: "_id naam",
    });

    res.status(200).json(response);
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
    ).populate(vakPath);
    await Vak.findByIdAndDelete(vakId);

    res.status(204).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
