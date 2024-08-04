// controllers/modalityController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Modality } from "../models/Modality";
import { RequestHandler } from "express";


export const getAllModalities: RequestHandler = async (req: Request, res: Response) => {
    try {
        const modalityRepository = AppDataSource.getRepository(Modality);
        const modalities: Modality[] = await modalityRepository.find({
            select: {
                idmodality: true,
                description: true,
            }
        });
        res.json(modalities);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};