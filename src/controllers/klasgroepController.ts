import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { Klasgroep } from "../models/KlasgroepModel";
import { Vak } from "../models/VakModel";
const { ValidationError } = MongooseError;

export const getKlasgroepen = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const gebruiker = req.gebruiker;
    const klasgroepen = await Klasgroep.find({ studenten: gebruiker.id });
    res.status(200).json(klasgroepen);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const klasgroep = await Klasgroep.findById(klasgroepId)
      .populate("studenten", "-wachtwoord")
      .populate("vakken", "_id naam");
    res.status(200).json(klasgroep);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const addKlasgroep = async (req: Request, res: Response) => {
  try {
    const { naam, beginjaar, eindjaar } = req.body;
    if (!naam || !beginjaar || !eindjaar) {
      throw new Error("Naam, beginjaar en eindjaar zijn verplicht");
    }
    const klasgroep = await Klasgroep.create({ naam, beginjaar, eindjaar });
    res.status(201).json(klasgroep);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const pushStudentToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      throw new Error("studentId is verplicht");
    }
    const klasgroep = await Klasgroep.findById(klasgroepId);

    if (!klasgroep) {
      throw new Error("Klasgroep niet gevonden");
    }

    if (klasgroep.studenten.find((s) => s.id == studentId)) {
      throw new Error("Student is al toegevoegd aan deze klasgroep");
    }

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
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const removeStudentFromKlasgroep = async (
  req: Request,
  res: Response
) => {
  try {
    const { klasgroepId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      throw new Error("studentId is verplicht");
    }
    const klasgroep = await Klasgroep.findById(klasgroepId).populate(
      "studenten",
      "-wachtwoord"
    );

    if (!klasgroep) {
      throw new Error("Klasgroep niet gevonden");
    }

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
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const pushVakToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { naam } = req.body;

    if (!naam) {
      throw new Error("naam is verplicht");
    }
    const klasgroep = await Klasgroep.findById(klasgroepId).populate("vakken");

    if (!klasgroep) {
      throw new Error("Klasgroep niet gevonden");
    }
    const _vak = await Vak.findOne({ naam, _id: { $in: klasgroep.vakken } });

    if (_vak) {
      throw new Error("Vak met deze naam bestaat al in deze klasgroep");
    }

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
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const removeVakFromKlasgroep = async (req: Request, res: Response) => {
  try {
    const { klasgroepId } = req.params;
    const { vakId } = req.body;

    if (!vakId) {
      throw new Error("vakId is verplicht");
    }

    await Klasgroep.findByIdAndUpdate(klasgroepId, {
      $pull: { vakken: vakId },
    });
    await Vak.findByIdAndDelete(vakId);

    res.status(200).json({ message: "Vak verwijderd" });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
