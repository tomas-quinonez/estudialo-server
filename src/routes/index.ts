import express from 'express';
import { categoryRouter } from './categoryRoutes';
import { levelRouter } from './levelRoutes';
import { modalityRouter } from './modalityRoutes';
import { courseRouter } from './courseRoutes';
import { learningPathRouter } from './learningPathRoutes';

export const routes = express.Router();

routes.use('/categories', categoryRouter);
routes.use('/levels', levelRouter);
routes.use('/modalities', modalityRouter);
routes.use('/courses', courseRouter);
routes.use('/learningpaths', learningPathRouter);