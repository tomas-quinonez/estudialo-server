// routes/modalityRoutes.ts

import { Router } from 'express';
import { getAllModalities } from '../controllers/modalityController';

export const modalityRouter = Router();

modalityRouter.get('/modalities', getAllModalities);