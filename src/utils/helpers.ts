import "dotenv/config";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import bcrypt from "bcrypt";

export const mailData = async (
  email: string,
  data: object,
  subject: string,
  template: "REGISTER" | "RESET"
) => {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY as string,
  });
  const sentFrom = new Sender(
    process.env.SMTP_USER as string,
    "Student Evaluatie Tool"
  );
  const recipients = [new Recipient(email)];
  const personalization = [{ email, data }];

  let template_id;
  switch (template) {
    case "REGISTER":
      template_id = process.env.MAILERSEND_TEMPLATE_ID_REGISTER as string;
      break;
    case "RESET":
      template_id = process.env.MAILERSEND_TEMPLATE_ID_RESET as string;
      break;
  }

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Student Evalutie Tool - ${subject}`)
    .setTemplateId(template_id)
    .setPersonalization(personalization);

  return { mailerSend, emailParams };
};

export const hashWachtwoord = async (wachtwoord: string) => {
  const saltRounds = 10;
  const hashedWachtwoord = await bcrypt.hash(wachtwoord, saltRounds);
  return hashedWachtwoord;
};

export const vakPath = { path: "vak", select: "_id naam" };
export const klasgroepPath = {
  path: "klasgroep",
  select: "_id naam beginjaar eindjaar",
};
