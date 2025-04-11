import { NextFunction, Request, Response } from "../utils/types";

export const helloMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Hello From Middleware");
  next();
};
