// routes/categoryRoutes.ts

import { Router } from 'express';
import * as service from '../controllers/categoryController';

export const categoryRouter = Router();

categoryRouter.get('/categories', service.getAllCategories);
categoryRouter.post('/save', service.save);