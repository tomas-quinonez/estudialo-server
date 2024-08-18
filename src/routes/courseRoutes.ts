// routes/courseRoutes.ts

import { Router } from 'express';
import { getAllCourses, getCourses, getCoursesFromInput } from '../controllers/courseController';
import { body, query } from "express-validator";
import { validateCourseFilters, validateCourseInput } from '../middlewares/validators/courseValidators';

export const courseRouter = Router();

courseRouter.get('/getallcourses', getAllCourses);
courseRouter.post('/getcourses', validateCourseFilters, getCourses);
courseRouter.post('/getcoursesfrominput', validateCourseInput, getCoursesFromInput);