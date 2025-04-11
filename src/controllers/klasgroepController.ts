import { Request, Response } from "../utils/types";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
import { BadRequestError, ErrorHandler, NotFoundError } from "../utils/errors";
import { vakPath2 as vakPath, vakPath2 } from "../utils/helpers";
import { Gebruiker } from "../models/GebruikerModel";

export const getKlasgroepen = async (req: Request, res: Response) => {
  try {
    const gebruiker = req.gebruiker;

    // Vraag alle klasgroepen op
    // Als de gebruiker geen docent is weergeef enkel de klasgroepen waar hij/zij in zit
    const klasgroepen = !gebruiker.isDocent
      ? await Klasgroep.find({
          studenten: gebruiker.id,
        })
          .select("-studenten")
          .populate(vakPath)
      : await Klasgroep.find().populate([
          { path: "studenten", select: "-wachtwoord" },
          vakPath2,
        ]);

    // Success response met klasgroepen; 200 - OK
    res.status(200).json(klasgroepen);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const getKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;

    // Check of klasgroep bestaat
    const gebruiker = req.gebruiker;
    const klasgroep = await Klasgroep.findById(klasgroepId)
      .populate([{ path: "studenten", select: "-wachtwoord" }, vakPath2])
      .select(gebruiker.isDocent ? "*" : "-studenten");
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Success response met klasgroep; 200 - OK
    res.status(200).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const addKlasgroep = async (req: Request, res: Response) => {
  try {
    // Check of naam, beginjaar en eindjaar in req.body zijn meegegeven
    const { naam, beginjaar, eindjaar } = req.body;
    if (!naam || !beginjaar || !eindjaar)
      throw new BadRequestError("Naam, beginjaar en eindjaar zijn verplicht");

    // Maak de klasgroep aan
    const klasgroep = await Klasgroep.create({ naam, beginjaar, eindjaar });

    // Success response met klasgroep; 201 - Created
    res.status(201).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const pushStudentToKlasgroep = async (req: Request, res: Response) => {
  try {
    // Check of studentId in req.body is meegegeven
    const { klasgroepId } = req.params;
    const { studentId } = req.body;
    if (!studentId) throw new BadRequestError("StudentId is verplicht");

    // Check of klasgroep bestaat
    const klasgroep = await Klasgroep.findById(klasgroepId);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Check of student bestaat
    const student = await Gebruiker.findById(studentId);
    if (!student) throw new NotFoundError("Student niet gevonden");

    // Voeg student toe aan klasgroep
    klasgroep.studenten.push(studentId);
    await klasgroep.save();

    // Success response met klasgroep; 200 - OK
    const response = await Klasgroep.populate(klasgroep, [
      vakPath2,
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
    // Check of studentId in req.body is meegegeven
    const { klasgroepId } = req.params;
    const { studentId } = req.body;
    if (!studentId) throw new BadRequestError("studentId is verplicht");

    // Check of klasgroep bestaat
    const klasgroep = await Klasgroep.findById(klasgroepId).populate([
      { path: "studenten", select: "-wachtwoord" },
      vakPath,
    ]);
    if (!klasgroep) throw new NotFoundError("Klasgroep niet gevonden");

    // Check of student wel in klasgroep zit
    if (!klasgroep.studenten.find((s) => s.id == studentId))
      throw new BadRequestError("Student zit niet in deze klasgroep");

    // Verwijder student van klasgroep
    klasgroep.studenten = klasgroep.studenten.filter(
      (student) => student.id !== studentId
    );
    await klasgroep.save();

    // Success response met klasgroep; 204 - No Content
    const response = await Klasgroep.populate(klasgroep, [
      vakPath2,
      { path: "studenten", select: "-wachtwoord" },
    ]);
    res.status(204).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const pushVakToKlasgroep = async (req: Request, res: Response) => {
  try {
    // Check of naam in req.body is meegegeven
    const { klasgroepId } = req.params;
    const { naam } = req.body;
    if (!naam) throw new BadRequestError("naam is verplicht");

    // Check of klasgroep bestaat
    const klasgroep = await Klasgroep.findById(klasgroepId).populate(vakPath2);
    if (!klasgroep) throw new BadRequestError("Klasgroep niet gevonden");

    // Maak nieuw vak aan en voeg het toe aan klasgroep
    const vak = await Vak.create({ naam });
    klasgroep.vakken.push(vak._id);
    await klasgroep.save();

    // Success response met klasgroep; 200 - OK
    const response = await Klasgroep.populate(klasgroep, vakPath2);
    res.status(200).json(response);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const removeVakFromKlasgroep = async (req: Request, res: Response) => {
  try {
    // Check of vakId in req.body is meegegeven
    const { klasgroepId } = req.params;
    const { vakId } = req.body;
    if (!vakId) throw new BadRequestError("vakId is verplicht");

    // Check of vak bestaat
    const vak = await Vak.findById(vakId);
    if (!vak) throw new NotFoundError("Vak niet gevonden");

    // Verwijder vak van klasgroep en verwijder vak uit db
    const klasgroep = await Klasgroep.findByIdAndUpdate(
      klasgroepId,
      {
        $pull: { vakken: vakId },
      },
      { new: true }
    ).populate(vakPath2);
    await Vak.findByIdAndDelete(vakId);

    // Success response met klasgroep; 204 - No content
    res.status(204).json(klasgroep);
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
