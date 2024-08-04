// routes/courseRoutes.ts

import { Router } from 'express';
import { getAllCourses, getCourses } from '../controllers/courseController';

export const courseRouter = Router();

courseRouter.get('/getallcourses', getAllCourses);
courseRouter.post('/getcourses', getCourses);