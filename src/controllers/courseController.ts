// controllers/courseController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../models/Course";
import { RequestHandler } from "express";
import { FindOperator, LessThanOrEqual, Repository } from "typeorm";
import { CourseQuery } from "./interfaces";
import { filterByKeywords } from "../services/courseService";

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


export const getCourses: RequestHandler = async (req: Request, res: Response) => {
    try {
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