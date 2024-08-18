import { check } from "express-validator";


export const validateCourseFilters = [
    check('keywords').optional().isArray({ min: 1, max: 5 }).withMessage('keywords debe ser un array de un máximo de 5 elementos'),
    check('idcategory').optional().isInt().withMessage('idcategory debe ser un entero'),
    check('idplatform').optional().isInt().withMessage('idplatform debe ser un entero'),
    check('duration').optional().isInt().withMessage('duration debe ser un entero'),
    check('cost').optional().isFloat().withMessage('cost debe ser un array'),
    check('idlevel').optional().isInt().withMessage('idlevel debe ser un entero'),
    check('idmodality').optional().isInt().withMessage('idmodality debe ser un entero'),
];

export const validateCourseInput = [
    check('input').exists().withMessage('').isString().withMessage('La entrada debe ser un texto').escape()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\d\s]+$/).withMessage('Solo se permiten caracteres y números')
    .isLength({ max: 60 }).withMessage('La entrada debe ser menor a 100 caracteres'),
];