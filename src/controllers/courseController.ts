// controllers/courseController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../models/Course";
import { RequestHandler } from "express";
import { LessThanOrEqual, Repository } from "typeorm";
import { CourseQuery, AiResponse } from "./interfaces";
import { filterByKeywords, extractionFunctionSchema } from "../services/courseService";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";
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


export const getLearningPath: RequestHandler = async (req: Request, res: Response) => {
    try {
        const input: string = req.body.input;

        // instanciar el parser
        const parser = new JsonOutputFunctionsParser();

        // instanciar la clase ChatOpenAI
        const model = new ChatOpenAI({ model: "gpt-4o-mini" });

        // crear un runnable, asociar la function que define el esquema JSON al modelo
        // y suministrar la salida al parser a traves de un pipe
        const runnable = model
            .bind({
                functions: [extractionFunctionSchema],
                function_call: { name: "hoja_de_ruta" },
            })
            .pipe(parser);

        // se invoca el runnable con la entrada
        const result: AiResponse = await runnable.invoke([
            new HumanMessage(input),
        ]);

        res.json(result?.lista_modulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};