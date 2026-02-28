import {Router} from 'express';
import {
    createGastronomicEvent,
    getGastronomicEvents,
    getGastronomicEventById,
    updateGastronomicEvent,
    getEventsByRestaurant,
    deleteGastronomicEvent,
    joinEvent,
    leaveEvent,
    applyEvent
} from './events.controller.js';

import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

router.get('/restaurant/:restaurantId', getEventsByRestaurant);
router.get('/', validateJWT, validateRole('ADMIN_ROLE', 'RES_ADMIN_ROLE'), getGastronomicEvents)//solo admin
router.get('/:id', getGastronomicEventById)


router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    createGastronomicEvent
);

router.patch(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    updateGastronomicEvent
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteGastronomicEvent
);

//acciones del cliente
router.post(
    '/:id/join',
    validateJWT,
    joinEvent
);

router.delete(
    '/:id/join',
    validateJWT,
    leaveEvent
);

router.post(
    '/:id/apply',
    validateJWT,
    applyEvent
);




export default router;