import { Response, NextFunction } from "express";

export function sendSuccessResponse(
  res: Response,
  data: any,
  statusCode: number = 200
) {
  res.status(statusCode).json(data);
}

export function sendErrorResponse(error: Error, next: NextFunction) {
  next(error);
}
