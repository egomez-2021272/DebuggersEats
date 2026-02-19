import { body } from "express-validator";
import { checkValidators } from "./checkValidators.js";

// Validaciones para registrar un Plato en el Menú
export const menuValidator = [
    body('restaurantId', 'El ID del restaurante es obligatorio y debe ser válido').notEmpty().isMongoId(),
    body('name', 'El nombre del platillo es obligatorio').notEmpty().trim().isLength({ max: 50 }),
    body('description', 'La descripción no puede exceder los 200 caracteres').optional().isLength({ max: 200 }),
    body('price', 'El precio es obligatorio y debe ser un número positivo').notEmpty().isFloat({ min: 0.01 }),
    body('category', 'La categoría debe ser: Entradas, Platos Fuertes, Postres o Bebidas')
        .notEmpty()
        .isIn(['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas']),
    checkValidators
];

// Validaciones para registrar una Mesa
export const tableValidator = [
    body('restaurantId', 'El ID del restaurante es obligatorio y debe ser válido').notEmpty().isMongoId(),
    body('number', 'El número de mesa es obligatorio y debe ser un número').notEmpty().isNumeric(),
    body('capacity', 'La capacidad debe ser un número entero entre 1 y 20').notEmpty().isInt({ min: 1, max: 20 }),
    body('location', 'La ubicación debe ser: Interior, Terraza o VIP')
        .optional()
        .isIn(['Interior', 'Terraza', 'VIP']),
    body('status', 'El estado debe ser: libre, ocupada o reservada')
        .optional()
        .isIn(['libre', 'ocupada', 'reservada']),
    checkValidators
];

// Validaciones para los Detalles/Dirección del Restaurante
export const detailsValidator = [
    body('restaurantId', 'El ID del restaurante es obligatorio y debe ser válido').notEmpty().isMongoId(),
    body('address.street', 'La calle es obligatoria').notEmpty().trim(),
    body('address.city', 'La ciudad es obligatoria').notEmpty().trim(),
    body('contact.phone', 'El formato del teléfono no es válido').notEmpty().isMobilePhone(),
    body('contact.email', 'El formato del correo es inválido').optional().isEmail(),
    body('schedule.open', 'El horario de apertura es obligatorio (ej: 09:00)').notEmpty(),
    body('schedule.close', 'El horario de cierre es obligatorio (ej: 22:00)').notEmpty(),
    checkValidators
];