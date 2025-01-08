import { NextFunction, Request, Response } from "express";
import logger from "./logger";

export class APIError extends Error {
  public statusCode: number;
  public data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof APIError) {
    logger.error(err);
    return res.status(err.statusCode).json({
      error: err.message,
      errorData: err.data,
    });
  }

  logger.error(new APIError(err.message, 500));
  return res.status(500).json({
    error: "Error Interno del Servidor",
  });
}
