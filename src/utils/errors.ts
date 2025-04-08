import { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
const { ValidationError } = MongooseError;
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
