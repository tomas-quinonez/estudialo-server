import { check } from "express-validator";


export const validateLearningPathInput = [
    check('input').exists().withMessage('').isString().withMessage('La entrada debe ser un texto').escape()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ.#!$\d\s]+$/).withMessage('Solo se permiten caracteres, números y #, !, $, .')
    .isLength({ max: 30 }).withMessage('La entrada debe ser menor a 30 caracteres'),
];