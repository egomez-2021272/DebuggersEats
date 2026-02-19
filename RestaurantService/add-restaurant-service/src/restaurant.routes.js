import { Router } from 'express';
import { createRestaurant } from './restaurant.controller.js';
import { validateCreateRestaurant } from '../middlewares/restaurant-validator.js';
import { validateRole } from '../middlewares/validate-role.js';
import { validateJWT } from '../middlewares/validate-jwt.js';


const router = Router();

router.post(
    '/',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    validateCreateRestaurant,
    createRestaurant
);

export default router;
