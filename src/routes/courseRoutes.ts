// routes/courseRoutes.ts

import { Router } from 'express';
import { getAllCourses, getCourses, getLearningPath } from '../controllers/courseController';
import { body, query } from "express-validator";

export const courseRouter = Router();

courseRouter.get('/getallcourses', getAllCourses);
courseRouter.post('/getcourses', getCourses);
courseRouter.post('/getlearningpath', getLearningPath);