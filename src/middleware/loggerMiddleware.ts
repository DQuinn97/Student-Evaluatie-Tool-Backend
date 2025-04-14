import { NextFunction, Request, Response } from "../utils/types";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  // debug middleware; dient enkel voor development
  console.log("Route has been called");
  next();
};
