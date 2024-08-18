import { check } from "express-validator";


export const validateLearningPathInput = [
    check('input').exists().withMessage('').isString().withMessage('La entrada debe ser un texto').escape()
    .matches(/^[A-Za-záéíóúÁÉÍÓÚñÑ\d\s]+$/).withMessage('Solo se permiten caracteres y números')
    .isLength({ max: 60 }).withMessage('La entrada debe ser menor a 100 caracteres'),
];