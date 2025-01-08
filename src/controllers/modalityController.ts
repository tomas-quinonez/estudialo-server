// controllers/modalityController.ts

import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Modality } from "../models/Modality";
import { RequestHandler } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../middlewares/responseHandlers";

export const getAllModalities: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const modalityRepository = AppDataSource.getRepository(Modality);
    const modalities: Modality[] = await modalityRepository.find({
      select: {
        idmodality: true,
        description: true,
      },
    });

    sendSuccessResponse(res, modalities);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};
