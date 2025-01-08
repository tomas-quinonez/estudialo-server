// controllers/categoryController.ts

import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Category } from "../models/Category";
import { RequestHandler } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../middlewares/responseHandlers";

export const getAllCategories: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categoryRepository = AppDataSource.getRepository(Category);
    const categories: Category[] = await categoryRepository.find({
      select: {
        idcategory: true,
        name: true,
        description: true,
      },
    });

    sendSuccessResponse(res, categories);
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
    const newCategory: Category = req.body;
    const categoryRepository = AppDataSource.getRepository(Category);
    const result = await categoryRepository.save(newCategory);

    sendSuccessResponse(res, result);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const deleteCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    const categoryRepository = AppDataSource.getRepository(Category);
    const result = await categoryRepository.delete({ idcategory: id });

    sendSuccessResponse(res, result);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};
