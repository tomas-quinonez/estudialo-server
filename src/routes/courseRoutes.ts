// routes/courseRoutes.ts

import { Router } from 'express';
import * as controller from '../controllers/courseController';
import { body, query } from "express-validator";
import { validateCourseFilters } from '../middlewares/validators/courseValidators';

export const courseRouter = Router();

courseRouter.post('/save', controller.save);
courseRouter.get('/allcourses', controller.getAllCourses);
courseRouter.post('/getcourses', validateCourseFilters, controller.getCourses);
courseRouter.post('/delete', controller.deleteCourse);
courseRouter.post('/scrape', controller.scrape);
courseRouter.post('/coursesbyfilters', controller.getCoursesByFilters);
courseRouter.post('/updatedollarvalue', controller.updateDollarCost);