// routes/categoryRoutes.ts

import { Router } from 'express';
import * as controller from '../controllers/categoryController';

export const categoryRouter = Router();

categoryRouter.post('/save', controller.save);
categoryRouter.get('/allcategories', controller.getAllCategories);
categoryRouter.post('/delete', controller.deleteCategory);