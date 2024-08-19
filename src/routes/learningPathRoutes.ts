// routes/learningPathRoutes.ts

import { Router } from 'express';
import { generateLearningPath } from '../controllers/learningPathController';
import { validateLearningPathInput } from '../middlewares/validators/learningPathValidators';

export const learningPathRouter = Router();

learningPathRouter.post('/generatelearningpath', validateLearningPathInput, generateLearningPath);