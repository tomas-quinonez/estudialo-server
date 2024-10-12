// controllers/categoryController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Category } from "../models/Category";
import { RequestHandler } from "express";


export const getAllCategories: RequestHandler = async (req: Request, res: Response) => {
    try {
        const categoryRepository = AppDataSource.getRepository(Category);
        const categories: Category[] = await categoryRepository.find({
            select: {
                idcategory: true,
                name: true,
                description: true,
            }
        });
        res.json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const save: RequestHandler = async (req: Request, res: Response) => {
    try {
        const newCategory: Category = req.body;
        const categoryRepository = AppDataSource.getRepository(Category);
        const result = categoryRepository.save(newCategory);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};