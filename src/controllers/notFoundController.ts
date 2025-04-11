import { Request, Response } from "../utils/types";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: `The requested endpoint doesn't exist.`,
    method: req.method,
    endpoint: req.originalUrl,
  });
};
