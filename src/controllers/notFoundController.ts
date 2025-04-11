import { Request, Response } from "../utils/types";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: `Deze endpoint bestaat niet`,
    method: req.method,
    endpoint: req.originalUrl,
  });
};
