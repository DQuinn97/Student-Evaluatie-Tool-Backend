import "dotenv/config";
import { Request, Response } from "express";
import generator from "generate-password";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Gebruiker } from "../models/GebruikerModel";
import {
  BadRequestError,
  ErrorHandler,
  UnauthorizedError,
} from "../utils/errors";
import { hashWachtwoord, mailData } from "../utils/helpers";

export const register = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email verplicht");
    }

    const gebruiker = await Gebruiker.findOne({ email });
    if (gebruiker) {
      throw new BadRequestError("Email al geregistreerd", 200);
    }

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

    res.status(201).json({
      message:
        "Gebruiker succesvol geregistreerd, wachtwoord per mail verzonden",
    });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, wachtwoord } = req.body;

    if (!email || !wachtwoord) {
      throw new BadRequestError("Email en wachtwoord verplicht");
    }

    const gebruiker = await Gebruiker.findOne({ email });
    if (!gebruiker) {
      throw new UnauthorizedError("Geen toegang tot deze pagina");
    }
    const juisteLogin = await bcrypt.compare(wachtwoord, gebruiker.wachtwoord);
    if (!juisteLogin) {
      throw new UnauthorizedError("Ongeldig wachtwoord");
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Gebruiker succesvol ingelogd", token });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : true,
      maxAge: 10,
    });
    res.status(200).json({ message: "Gebruiker succesvol uitgelogd" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
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
      throw new BadRequestError("Geen herkende gebruiker", 200);
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

    res.status(201).json({ message: "Wachtwoord reset aanvraag verstuurd" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const resetWachtwoord = async (req: Request, res: Response) => {
  try {
    const { wachtwoord, resetToken } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error("Internal server error");
    }

    if (!wachtwoord || !resetToken) {
      throw new BadRequestError("Wachtwoord en resetToken zijn verplicht");
    }
    const decodedToken = jwt.verify(
      resetToken,
      process.env.JWT_SECRET as string
    );
    if (typeof decodedToken === "string" || !("email" in decodedToken)) {
      throw new BadRequestError("Foutieve reset link.");
    }
    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) {
      throw new UnauthorizedError("Geen toegang tot deze pagina");
    }
    const hashedWachtwoord = await hashWachtwoord(wachtwoord);
    gebruiker.wachtwoord = hashedWachtwoord;
    gebruiker.resetToken = null;
    await gebruiker.save();
    res.status(200).json({ message: "Wachtwoord succesvol gereset" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
