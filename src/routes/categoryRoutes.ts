// routes/routeController.ts

import { Router } from 'express';
import { getAllCategories } from '../controllers/categoryController';

export const categoryRouter = Router();

categoryRouter.get('/getallcategories', getAllCategories);