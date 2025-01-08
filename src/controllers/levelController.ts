// controllers/levelController.ts

import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Level } from "../models/Level";
import { RequestHandler } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../middlewares/responseHandlers";

export const getAllLevels: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const levelRepository = AppDataSource.getRepository(Level);
    const levels: Level[] = await levelRepository.find({
      select: {
        idlevel: true,
        description: true,
      },
    });

    sendSuccessResponse(res, levels);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};
