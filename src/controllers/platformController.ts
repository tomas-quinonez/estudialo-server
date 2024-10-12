// controllers/platformController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { RequestHandler } from "express";
import { Platform } from "../models/Platform";


export const getAllPlatforms: RequestHandler = async (req: Request, res: Response) => {
    try {
        const platformRepository = AppDataSource.getRepository(Platform);
        const platforms: Platform[] = await platformRepository.find({
            select: {
                idplatform: true,
                name: true,
                description: true,
            }
        });
        res.json(platforms);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const save: RequestHandler = async (req: Request, res: Response) => {
    try {
        const newPlatform: Platform = req.body;
        console.log(newPlatform);
        
        const platformRepository = AppDataSource.getRepository(Platform);
        const result = await platformRepository.save(newPlatform);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};