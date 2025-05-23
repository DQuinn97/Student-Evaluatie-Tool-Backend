import "dotenv/config";
import { Request, Response } from "../utils/types";
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
import { verifyChallenge } from "pkce-challenge";

export const register = async (req: Request, res: Response) => {
  try {
    // Check of email is meegegeven in req.body
    const { email } = req.body;
    if (!email) throw new BadRequestError("'email' verplicht");

    // Check of er al een gebruiker met deze email bestaat
    const gebruiker = await Gebruiker.findOne({ email });
    if (gebruiker) throw new BadRequestError("Email al geregistreerd", 200);

    // Genereer een nieuw random wachtwoord
    const wachtwoord = generator.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
    });

    // Genereer de data die in de mailer moet worden verzonden
    const { mailer, v, emailParams } = await mailData(
      email,
      { naam: email.split("@")[0], wachtwoord },
      "register",
      "REGISTER"
    );

    // Verstuur de mail naar de nieuwe gebruiker
    await mailer.post("send", v).request(emailParams);

    // Hash het wachtwoord voordat het in de db word gestoken
    const hashedWachtwoord = await hashWachtwoord(wachtwoord);

    // Maak de nieuwe gebruiker aan in de db
    await Gebruiker.create({ email, wachtwoord: hashedWachtwoord });

    // Verstuur een success response; 201 - Created
    res.status(201).json({
      message:
        "Gebruiker succesvol geregistreerd, wachtwoord per mail verzonden",
    });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const authorize = async (req: Request, res: Response) => {
  try {
    // Check of email, wachtwoord, code_challenge en redirect_url in req.body zijn meegegeven
    const { email, wachtwoord, code_challenge, redirect_url } = req.body;
    if (!email || !wachtwoord || !code_challenge || !redirect_url)
      throw new BadRequestError(
        "'email', 'wachtwoord', 'redirect_url' en 'code_challenge' verplicht"
      );

    // Check of gebruiker met deze email bestaat
    const gebruiker = await Gebruiker.findOne({ email });
    if (!gebruiker) throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Check of wachtwoord juist is voor deze email
    const juisteLogin = await bcrypt.compare(wachtwoord, gebruiker.wachtwoord);
    if (!juisteLogin) throw new UnauthorizedError("Ongeldig wachtwoord");

    // Check of JWT_SECRET is geconfigureerd
    if (!process.env.JWT_SECRET) throw new Error("Internal server error");

    // Genereer een JWT token
    const token = jwt.sign(
      {
        id: gebruiker._id,
        email: gebruiker.email,
        code_challenge,
        subject: "verify",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Stuur een success response met de token; 200 - OK
    res.status(200).json({ redirect: `${redirect_url}/${token}` });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    // Check of code_verifier in req.body en token in req.query zijn meegegeven
    const { token } = req.query;
    const { code_verifier } = req.body;
    if (!token || !code_verifier)
      throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Check of JWT_SECRET is geconfigureerd
    if (!process.env.JWT_SECRET) throw new Error("Internal server error");

    // Check of token geldig is
    const decodedToken = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
    if (
      typeof decodedToken === "string" ||
      !("subject" in decodedToken) ||
      !(decodedToken.subject === "verify")
    )
      throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Valideer de PKCE challenge
    const validateChallenge = await verifyChallenge(
      code_verifier,
      decodedToken.code_challenge
    );
    if (!validateChallenge)
      throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Check of gebruiker uit token juist is
    const gebruiker = await Gebruiker.findById(decodedToken.id);
    if (!gebruiker) throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Genereer een JWT token
    const jwtToken = jwt.sign(
      {
        id: gebruiker._id,
        email: gebruiker.email,
        subject: "authorize",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Verstuur een success response met token; 200 - OK
    res
      .status(200)
      .json({ message: "Gebruiker succesvol ingelogd", token: jwtToken });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

// DEPRECATED: doet niets meer in effect, maar kan nog altijd aangeroepen worden om front-end errors te voorkomen
export const logout = async (req: Request, res: Response) => {
  try {
    // Verstuur een success response met verwijderde cookie; 200 - OK
    res.status(200).json({ message: "Gebruiker succesvol uitgelogd" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const resetWachtwoordRequest = async (req: Request, res: Response) => {
  try {
    // Check of email en reset_link zijn meegegeven in req.body
    const { email, reset_link } = req.body;
    if (!email || !reset_link)
      throw new BadRequestError("'email' en 'reset_link' verplicht");

    // Check of gebruiker met email bestaat
    const gebruiker = await Gebruiker.findOne({ email });
    if (!gebruiker) throw new BadRequestError("Geen herkende gebruiker", 200);

    // Check of JWT_RESET is geconfigureerd
    if (!process.env.JWT_RESET) throw new Error("Internal server error");

    // Genereer JWT reset token
    const resetToken = jwt.sign(
      {
        id: gebruiker._id,
        email: gebruiker.email,
      },
      process.env.JWT_RESET,
      { expiresIn: "1d" }
    );

    // Genereer de data die in de mailer moet worden verzonden
    const naam = gebruiker.naam
      ? `${gebruiker.naam} ${gebruiker.achternaam || ""}`
      : email.split("@")[0];
    const { mailer, v, emailParams } = await mailData(
      email,
      { naam, reset_link: `${reset_link}/${resetToken}` },
      "reset wachtwoord",
      "RESET"
    );

    // Sla reset token op in gebruiker in db
    gebruiker.resetToken = resetToken;
    await gebruiker.save();

    // Verstuur de email naar de gebruiker
    await mailer.post("send", v).request(emailParams);

    // Verstuur een success response; 201 - Created
    res.status(201).json({ message: "Wachtwoord reset aanvraag verstuurd" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

export const resetWachtwoord = async (req: Request, res: Response) => {
  try {
    // Check of wachtwoord en resetToken zijn meegegeven in req.body
    const { wachtwoord, resetToken } = req.body;
    if (!wachtwoord || !resetToken)
      throw new BadRequestError("'wachtwoord' en 'resetToken' zijn verplicht");

    // Check of JWT_RESET is geconfigureerd
    if (!process.env.JWT_RESET) throw new Error("Internal server error");

    // Verifieer de resetToken
    const decodedToken = jwt.verify(
      resetToken,
      process.env.JWT_RESET as string
    );
    if (typeof decodedToken === "string" || !("email" in decodedToken))
      throw new BadRequestError("Foutieve reset link.");

    // Verifeer de gebruiker op basis van de resetToken
    const gebruiker = await Gebruiker.findOne({ email: decodedToken.email });
    if (!gebruiker) throw new UnauthorizedError("Geen toegang tot deze pagina");
    if (gebruiker.resetToken !== resetToken)
      throw new UnauthorizedError("Geen toegang tot deze pagina");

    // Hash nieuw wachtwoord voordat het in de db word opgeslagen
    const hashedWachtwoord = await hashWachtwoord(wachtwoord);
    gebruiker.wachtwoord = hashedWachtwoord;

    // Verwijder resetToken uit de gebruiker in de db
    gebruiker.resetToken = null;
    await gebruiker.save();

    // Verstuur een success response; 200 - OK
    res.status(200).json({ message: "Wachtwoord succesvol gereset" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};

/* Deze functie dient enkel om te testen in de front-end of cookies worden toegelaten
 * Dus dit test ofdat login wel mogelijk is door op een geauthoriseerde route een GET request te doen
 *  die enkel een status weergeeft.
 *
 * 200 - OK; de gebruiker heeft toegang tot ingelogde data, dus cookies worden opgeslagen
 * 401 - Unauthorized; de gebruiker heeft geen toegang tot ingelogde data, en kan dus niet inloggen
 */
export const authTest = async (req: Request, res: Response) => {
  try {
    // Verstuur een success response; 200 - OK
    res.status(200).json({ message: "Gebruiker kan inloggen" });
  } catch (error: unknown) {
    ErrorHandler(error, req, res);
  }
};
