// routes/learningPathRoutes.ts

import { Router } from 'express';
import { getLearningPath } from '../controllers/learningPathController';
import { validateLearningPathInput } from '../middlewares/validators/learningPathValidators';

export const learningPathRouter = Router();

learningPathRouter.post('/getlearningpath', validateLearningPathInput, getLearningPath);