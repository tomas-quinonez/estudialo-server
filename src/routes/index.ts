import express from 'express';
import { categoryRouter } from './categoryRoutes';
import { levelRouter } from './levelRoutes';

export const routes = express.Router();

routes.use('/categories', categoryRouter);
routes.use('/levels', levelRouter);