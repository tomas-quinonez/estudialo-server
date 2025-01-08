// controllers/courseController.ts

import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../models/Course";
import { CourseFilters, ScrapedCourse, SuggestedCourse } from "./interfaces";
import { RequestHandler } from "express";
import { LessThanOrEqual, Repository } from "typeorm";
import { CourseQuery } from "./interfaces";
import * as service from "../services/courseService";
import { validationResult } from "express-validator";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../middlewares/responseHandlers";

export const save: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newCourse: Course = req.body;
    const courseRepository = AppDataSource.getRepository(Course);
    const result = await courseRepository.save(newCourse);

    sendSuccessResponse(res, result);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const getAllCourses: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const courses: Course[] = await courseRepository.find({
      select: {
        name: true,
        description: true,
        duration: true,
        cost: true,
        priority: true,
        category: {
          name: true,
          description: true,
        },
        level: {
          description: true,
        },
        platform: {
          name: true,
          description: true,
        },
        modality: {
          description: true,
        },
      },
      relations: {
        category: true,
        platform: true,
        level: true,
        modality: true,
      },
    });

    sendSuccessResponse(res, courses);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

// Se obtienen los cursos de la DB habiendo aplicado los filtros (opcionales)
export const getCourses: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query: CourseQuery = {
      idcategory: req.body.idcategory,
      idplatform: req.body.idplatform,
      duration: LessThanOrEqual(req.body.duration),
      cost: LessThanOrEqual(req.body.cost),
      idlevel: req.body.idlevel,
      idmodality: req.body.idmodality,
    };

    const courseRepository: Repository<Course> =
      AppDataSource.getRepository(Course);
    var courses: Course[] = await courseRepository.find({
      select: {
        name: true,
        description: true,
        duration: true,
        cost: true,
        url: true,
        priority: true,
        category: {
          name: true,
          description: true,
        },
        level: {
          description: true,
        },
        platform: {
          name: true,
          description: true,
        },
        modality: {
          description: true,
        },
      },
      relations: {
        category: true,
        platform: true,
        level: true,
        modality: true,
      },
      where: query,
    });

    if (req.body.keywords) {
      courses = service.filterByKeywords(req.body.keywords, courses);
    }
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteCourse: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;
    const courseRepository = AppDataSource.getRepository(Course);
    const result = await courseRepository.delete({ idcourse: id });

    sendSuccessResponse(res, result);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const scrape: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic } = req.body;
    const scrapedCourses: ScrapedCourse[] = await service.scrapeCourses(
      String(topic)
    );

    sendSuccessResponse(res, scrapedCourses);
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const getCoursesByFilters: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: CourseFilters = req.body;
    const courses: Course[] | SuggestedCourse[] =
      await service.coursesByFilters(filters);

    if (courses[0] && "description" in courses[0]) {
      sendSuccessResponse(res, { courses: courses });
    } else {
      sendSuccessResponse(res, { courses: [], suggestedCourses: courses });
    }
  } catch (error: any) {
    sendErrorResponse(error, next);
  }
};

export const updateDollarCost: RequestHandler = async (
  _req: Request,
  res: Response
) => {
  try {
    await service.updateDollarCost();
    res.json({ message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
