import { Router } from 'express';
import { createReservation, getReservation, updateReservation, deleteReservation, confirmOrCancelReservation, checkDisponibilidad, getReservationsByRestaurant } from './reservation.controller.js';
import { validateCreateReservation, validateUpdateReservation, validateTokenAction } from '../../middlewares/reservation-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js'

const router = Router();

router.use(validateJWT);

router.post(
    '/',
    validateCreateReservation,
    createReservation
);

router.post(
    '/confirm',
    validateTokenAction,
    confirmOrCancelReservation);

router.get(
    '/',
    getReservation
);

router.put(
    '/:id',
    validateUpdateReservation,
    updateReservation
);

router.delete(
    '/:id',
    deleteReservation
);

router.get(
    '/disponibilidad/:restaurantName',
    checkDisponibilidad
);

router.get(
    '/restaurant/:restaurantName',
    validateRole('RES_ADMIN_ROLE'),
    getReservationsByRestaurant
)
export default router;