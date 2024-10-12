// routes/platformRoutes.ts

import { Router } from 'express';
import * as service from '../controllers/platformController';

export const platformRouter = Router();

platformRouter.get('/platforms', service.getAllPlatforms);
platformRouter.post('/save', service.save);