// routes/platformRoutes.ts

import { Router } from 'express';
import * as controller from '../controllers/platformController';

export const platformRouter = Router();

platformRouter.get('/platforms', controller.getAllPlatforms);
platformRouter.post('/save', controller.save);