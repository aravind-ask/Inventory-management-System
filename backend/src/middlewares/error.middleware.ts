import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (err instanceof BadRequestError) {
    return res.status(status).json({ message, errors: err.errors });
  }

  if (err instanceof UnauthorizedError || err instanceof NotFoundError) {
    return res.status(status).json({ message });
  }

  console.error(err);
  res.status(status).json({ message });
};
