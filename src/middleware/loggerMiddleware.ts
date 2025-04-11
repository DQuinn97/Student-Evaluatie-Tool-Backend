import { NextFunction, Request, Response } from "../utils/types";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log("Route has been called");
  next();
};
