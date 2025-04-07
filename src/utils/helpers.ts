import "dotenv/config";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
const { ValidationError } = MongooseError;

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

export class UnauthorizedError extends Error {
  constructor(
    message: string = "Unauthorized access",
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends Error {
  constructor(
    message: string = "Bad request",
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string = "Page not found",
    public statusCode: number = 404
  ) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = statusCode;
  }
}

export const ErrorHandler = (error: unknown, req: Request, res: Response) => {
  if (
    error instanceof BadRequestError ||
    error instanceof UnauthorizedError ||
    error instanceof NotFoundError
  ) {
    res.status(error.statusCode).json({ message: error.message });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
  } else if (error instanceof Error) {
    res.status(500).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
};
