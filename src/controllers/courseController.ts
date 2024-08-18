// controllers/courseController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../models/Course";
import { CoursesAiResponse } from "./interfaces";
import { RequestHandler } from "express";
import { LessThanOrEqual, Repository } from "typeorm";
import { CourseQuery } from "./interfaces";
import { filterByKeywords, invokeRunnable } from "../services/courseService";
import { validationResult } from "express-validator";


export const getAllCourses: RequestHandler = async (req: Request, res: Response) => {
    try {
        const courseRepository = AppDataSource.getRepository(Course);
        const courses: Course[] = await courseRepository.find({
            select: {
                name: true,
                description: true,
                duration: true,
                cost: true,
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
            courses = filterByKeywords(req.body.keywords, courses);
        }
        res.json(courses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// A partir de una descripcion se retorna una lista de links a los cursos solicitados (solo los links)
export const getCoursesFromInput: RequestHandler = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const input: string = req.body.input;

        const result: CoursesAiResponse = await invokeRunnable(input);

        res.json(result?.courses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};