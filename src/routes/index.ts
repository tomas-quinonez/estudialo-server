import express from 'express';
import { categoryRouter } from './categoryRoutes';

export const routes = express.Router();

routes.use('/categories', categoryRouter);