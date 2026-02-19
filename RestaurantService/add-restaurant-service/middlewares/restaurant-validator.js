import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

export const validateCreateRestaurant = [

    body('name')
        .notEmpty().withMessage('Nombre requerido'),

    body('address')
        .notEmpty().withMessage('Dirección requerida'),

    body('phone')
        .notEmpty().withMessage('Teléfono requerido'),

    body('category')
        .notEmpty().withMessage('Categoría requerida')
        .isIn(['COMIDA_RAPIDA', 'ITALIANA', 'CHINA', 'MEXICANA', 'CAFETERIA'])
        .withMessage('Categoría no válida'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        next();
    }
];