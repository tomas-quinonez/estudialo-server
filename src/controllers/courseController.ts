// controllers/courseController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../models/Course";
import { CourseFilters, ScrapedCourse, SuggestedCourse } from "./interfaces";
import { RequestHandler } from "express";
import { LessThanOrEqual, Repository } from "typeorm";
import { CourseQuery } from "./interfaces";
import * as service from "../services/courseService";
import { validationResult } from "express-validator";


export const save: RequestHandler = async (req: Request, res: Response) => {
  try {
      const newCourse: Course = req.body;
      const courseRepository = AppDataSource.getRepository(Course);
      const result = await courseRepository.save(newCourse);

      res.json(result);
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllCourses: RequestHandler = async (req: Request, res: Response) => {
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
        }
      },
      relations: {
        category: true,
        platform: true,
        level: true,
        modality: true,
      }
    });
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Se obtienen los cursos de la DB habiendo aplicado los filtros (opcionales)
export const getCourses: RequestHandler = async (req: Request, res: Response) => {
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

    const courseRepository: Repository<Course> = AppDataSource.getRepository(Course);
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
        }
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCourse: RequestHandler = async (req: Request, res: Response) => {
  try {
      const { id } = req.body;
      
      const courseRepository = AppDataSource.getRepository(Course);
      const result = await courseRepository.delete({ idcourse: id});
      res.json({ message: 'Borrado exitoso'});
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const scrape: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    const scrapedCourses: ScrapedCourse[] = await service.scrapeCourses(String(topic));

    res.json(scrapedCourses).status(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCoursesByFilters: RequestHandler = async (req: Request, res: Response) => {
  try {
    const filters: CourseFilters = req.body;
    const courses: Course[] | SuggestedCourse[] = await service.coursesByFilters(filters);
    console.log(courses);
    

    if (courses[0] && 'description' in courses[0]) {
      res.json({ courses: courses });
    } else {
      res.json({ courses: [], suggestedCourses: courses });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const updateDollarCost: RequestHandler = async (_req: Request, res: Response) => {
  try {
    await service.updateDollarCost();
    res.json({ message: 'ok' })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}