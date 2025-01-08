// controllers/platformController.ts

import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { RequestHandler } from "express";
import { Platform } from "../models/Platform";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../middlewares/responseHandlers";

export const getAllPlatforms: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const platformRepository = AppDataSource.getRepository(Platform);
    const platforms: Platform[] = await platformRepository.find({
      select: {
        idplatform: true,
        name: true,
        description: true,
      },
    });
    sendSuccessResponse(res, platforms);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const save: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newPlatform: Platform = req.body;
    const platformRepository = AppDataSource.getRepository(Platform);
    const result = await platformRepository.save(newPlatform);

    sendSuccessResponse(res, result);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const deletePlatform: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    const platformRepository = AppDataSource.getRepository(Platform);
    const result = await platformRepository.delete({ idplatform: id });

    sendSuccessResponse(res, result);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};
