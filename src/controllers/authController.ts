import "dotenv/config";
import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import generator from "generate-password";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Gebruiker } from "../models/GebruikerModel";
import { hashWachtwoord, mailData } from "../utils/helpers";

export const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const wachtwoord = generator.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
    });

    const { mailerSend, emailParams } = await mailData(
      email,
      { naam: email.split("@")[0], wachtwoord },
      "register",
      "REGISTER"
    );

    await mailerSend.email.send(emailParams);

    const hashedWachtwoord = await hashWachtwoord(wachtwoord);

    await Gebruiker.create({ email, wachtwoord: hashedWachtwoord });

    res
      .status(200)
      .json({ message: "Gebruiker succesvol geregistreerd, wachtwoord per mail verzonden" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, wachtwoord } = req.body;

    if (!email || !wachtwoord) {
      res.status(400).json({ message: "Onvolledige gebruikers data" });
      return;
    }

    const gebruiker = await Gebruiker.findOne({ email });
    if (!gebruiker) {
      res.status(400).json({ message: "Onbekende gebruiker" });
      return;
    }
    const juisteLogin = await bcrypt.compare(wachtwoord, gebruiker.wachtwoord);
    if (!juisteLogin) {
      res.status(400).json({ message: "Ongeldige login" });
      return;
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("Internal server error");
    }
    const token = jwt.sign(
      {
        id: gebruiker._id,
        email: gebruiker.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "Gebruiker succesvol ingelogd" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 10,
    });
    res.status(200).json({ message: "Gebruiker succesvol uitgelogd" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const resetWachtwoordRequest = async (req: Request, res: Response) => {
  try {
    const { email, reset_link } = req.body;
    const gebruiker = await Gebruiker.findOne({ email });

    if (!process.env.JWT_SECRET) {
      throw new Error("Internal server error");
    }

    if (!gebruiker) {
      res.status(400).json({ message: "Onbekende gebruiker" });
      return;
    }

    const resetToken = jwt.sign(
      {
        id: gebruiker._id,
        email: gebruiker.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const naam = gebruiker.naam
      ? `${gebruiker.naam} ${gebruiker.achternaam}`
      : email.split("@")[0];
    const { mailerSend, emailParams } = await mailData(
      email,
      { naam, reset_link: `${reset_link}/${resetToken}` },
      "reset wachtwoord",
      "RESET"
    );

    gebruiker.resetToken = resetToken;
    await gebruiker.save();

    await mailerSend.email.send(emailParams);

    res.status(200).json({ message: "Wachtwoord reset aanvraag verstuurd" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const resetWachtwoord = async (req: Request, res: Response) => {
  try {
    const { wachtwoord, resetToken } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error("Internal server error");
    }

    if (!wachtwoord || !resetToken) {
      res.status(400).json({ message: "Ontbrekende reset data" });
      return;
    }
    const decodedToken = jwt.verify(
      resetToken,
      process.env.JWT_SECRET as string
    );
    if (typeof decodedToken === "string" || !("email" in decodedToken)) {
      res.status(400).json({ message: "Foutieve reset link." });
      return;
    }
    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) {
      res.status(400).json({ message: "Geen herkende gebruiker" });
      return;
    }
    const hashedWachtwoord = await hashWachtwoord(wachtwoord);
    gebruiker.wachtwoord = hashedWachtwoord;
    gebruiker.resetToken = null;
    await gebruiker.save();
    res.status(200).json({ message: "Wachtwoord succesvol gereset" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};
