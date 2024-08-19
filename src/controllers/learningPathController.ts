// controllers/learningPathController.ts

import { Request, Response } from "express";
import { RequestHandler } from "express";
import { LearningPathAiResponse } from "./interfaces";
import { invokeRunnable } from "../services/learningPathService";
import { validationResult } from "express-validator";


export const generateLearningPath: RequestHandler = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const input: string = req.body.input;

        const result: LearningPathAiResponse = await invokeRunnable(input);

        res.json(result?.lista_modulos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};