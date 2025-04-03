import { Request, Response } from "express";
import { Todo } from "../models/exampleModel";
import { Error as MongooseError } from "mongoose";
import { Klasgroep } from "../models/KlasgroepModel";
const { ValidationError } = MongooseError;

export const getKlasgroepen = async (req: Request, res: Response) => {
  try {
    const klasgroepen = await Klasgroep.find();
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
    const { id } = req.params;
    const klasgroep = await Klasgroep.findById(id).populate(
      "studenten",
      "-wachtwoord"
    );
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

export const pushToKlasgroep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      throw new Error("studentId is verplicht");
    }
    const klasgroep = await Klasgroep.findById(id);

    if (!klasgroep) {
      throw new Error("Klasgroep niet gevonden");
    }

    if (klasgroep.studenten.includes(studentId)) {
      throw new Error("Student is al toegevoegd aan deze klasgroep");
    }

    klasgroep.studenten.push(studentId);
    await klasgroep.save();

    res.status(200).json(klasgroep);
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

export const removeFromKlasgroep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      throw new Error("studentId is verplicht");
    }
    const klasgroep = await Klasgroep.findById(id).populate(
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

    res.status(200).json(klasgroep);
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
