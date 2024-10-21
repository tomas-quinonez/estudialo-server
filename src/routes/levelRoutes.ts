// routes/levelRoutes.ts

import { Router } from 'express';
import { getAllLevels } from '../controllers/levelController';

export const levelRouter = Router();

levelRouter.get('/alllevels', getAllLevels);