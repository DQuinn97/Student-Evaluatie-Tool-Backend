import "dotenv/config";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import bcrypt from "bcrypt";
import Mailjet from "node-mailjet";

/**
 * MailerSend configs en functies
 */
export const mailData = async (
  email: string,
  data: object,
  subject: string,
  template: "REGISTER" | "RESET"
) => {
  // MailerSend init
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY as string,
  });

  const apiKey = process.env.MAILJET_API_KEY as string;
  const apiSecret = process.env.MAILJET_API_SECRET as string;
  const mailer = Mailjet.apiConnect(apiKey, apiSecret, {
    config: {},
    options: {},
  });

  // Applicatie data
  const sentFrom = new Sender(
    process.env.SMTP_USER as string,
    "Student Evaluatie Tool"
  );

  // Gebruiker data
  const recipients = [new Recipient(email)];

  // data die in de mail header moet staan
  const personalization = [{ email, data }];

  // welke template te gebruiken voor de mail
  let template_id;
  switch (template) {
    case "REGISTER":
      template_id = process.env.MAILERSEND_TEMPLATE_ID_REGISTER as string;
      break;
    case "RESET":
      template_id = process.env.MAILERSEND_TEMPLATE_ID_RESET as string;
      break;
  }

  // MailerSend parameters configuratie
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Student Evalutie Tool - ${subject}`)
    .setTemplateId(template_id)
    .setPersonalization(personalization);

  // return de config en parameter config
  return { mailerSend, emailParams };
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
