import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import multer from "multer";
const { ValidationError } = MongooseError;

/** 
 * Error voor verboden toegang;
 * - 401: niet ingelogd
 * - 403: ingelogd maar geen toegang
 */
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

/** 
 * Error voor foutieve request;
 * - 400: foutieve of ontbrekende data in body
 * - 409: data bestaat al
 * - 415: foutieve file upload
*/
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

/**
 * Error voor niet gevonden pagina
 * - 404: pagina of item bestaat niet
 */
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

/**
 * ErrorHandler: behandeld alle errors in dit project
 */
export const ErrorHandler = (error: unknown, req: Request, res: Response) => {
  if (
    error instanceof BadRequestError ||
    error instanceof UnauthorizedError ||
    error instanceof NotFoundError
  ) {
    res.status(error.statusCode).json({ message: error.message });
  } else if (error instanceof multer.MulterError) {
    res.status(415).json({ message: "Foutieve file upload" });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
  } else if (error instanceof Error) {
    res.status(500).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }
};
