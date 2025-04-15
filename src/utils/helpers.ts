import "dotenv/config";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import bcrypt from "bcrypt";
import Mailjet from "node-mailjet";
import { RequestConfig } from "node-mailjet/declarations/request/Request";

/**
 * MailerSend configs en functies
 */
export const mailData = async (
  email: string,
  data: { naam?: string; wachtwoord?: string; reset_link?: string },
  subject: string,
  template: "REGISTER" | "RESET"
) => {
  // mailer init
  const apiKey = process.env.MAILJET_API_KEY as string;
  const apiSecret = process.env.MAILJET_API_SECRET as string;
  const mailer = Mailjet.apiConnect(apiKey, apiSecret, {
    config: {},
    options: {},
  });

  // welke template te gebruiken voor de mail
  let template_id;
  switch (template) {
    case "REGISTER":
      template_id = process.env.MAILJET_TEMPLATE_ID_REGISTER as string;
      break;
    case "RESET":
      template_id = process.env.MAILJET_TEMPLATE_ID_RESET as string;
      break;
  }

  // email parameters
  const emailParams = {
    Messages: [
      {
        To: [
          {
            Email: email,
            Name: data.naam,
          },
        ],
        TemplateID: +template_id,
        TemplateLanguage: true,
        Variables: data,
      },
    ],
  };
  const v = { version: "v3.1" } as Partial<RequestConfig>;

  // return de config en parameter config
  return { mailer, v, emailParams };
};

// Hash wachtwoord
export const hashWachtwoord = async (wachtwoord: string) => {
  const saltRounds = 10;
  const hashedWachtwoord = await bcrypt.hash(wachtwoord, saltRounds);
  return hashedWachtwoord;
};

// Veelgebruikte paths voor populate
export const vakPath = { path: "vak", select: "_id naam" };
export const vakPath2 = { path: "vakken", select: "_id naam" };
export const klasgroepPath = {
  path: "klasgroep",
  select: "_id naam beginjaar eindjaar",
};
