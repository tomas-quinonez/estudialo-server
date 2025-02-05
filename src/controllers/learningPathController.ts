// controllers/learningPathController.ts

import { NextFunction, Request, Response } from "express";
import { RequestHandler } from "express";
import { LearningPathAiResponse } from "./interfaces";
import { invokeRunnable } from "../services/learningPathService";
import { validationResult } from "express-validator";
import { APIError } from "../middlewares/errorHandling";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../middlewares/responseHandlers";
import { validateInputContent } from "../middlewares/validators/learningPathValidators";

export const generateLearningPath: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new APIError(
        "Error en la entrada del usuario",
        400,
        errors.array()
      );
    }

    const input: string = req.body.input;
    const contentValResult: string = await validateInputContent(input);

    if (contentValResult != "si") {
      throw new APIError(
        "Error contenido de la entrada no válido",
        400,
        "El contenido debe estar relacionado a formación académica. Entrada: " +
          input
      );
    }

    const result: LearningPathAiResponse = await invokeRunnable(input);

    sendSuccessResponse(res, result?.lista_modulos);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};
