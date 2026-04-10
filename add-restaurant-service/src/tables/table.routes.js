import { Router } from 'express';
import { createTable, getTablesByRestaurant, getTableById, updateTable, toggleTableStatus, deleteTable } from './table.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

//consultar mesas de un restaurante — disponible para clientes autenticados (para escoger al reservar)
router.get(
    '/restaurant/:restaurantId',
    validateJWT,
    getTablesByRestaurant
);

//consultar una mesa específica
router.get(
    '/:id',
    validateJWT,
    getTableById
);

//solo RES_ADMIN gestiona sus propias mesas
router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    createTable
);

router.patch(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    updateTable
);

router.patch(
    '/:id/status',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    toggleTableStatus
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteTable
);

export default router;
