// controllers/levelController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Level } from "../models/Level";
import { RequestHandler } from "express";


export const getAllLevels: RequestHandler = async (req: Request, res: Response) => {
    try {
        const categoryRepository = AppDataSource.getRepository(Level);
        const levels: Level[] = await categoryRepository.find({
            select: {
                idlevel: true,
                description: true,
            }
        });
        res.json(levels);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};