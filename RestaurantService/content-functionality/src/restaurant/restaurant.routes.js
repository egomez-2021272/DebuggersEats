import { Router } from 'express';
// Importamos solo los controladores (asegúrate que el nombre del archivo sea exacto)
import { registerRestaurantContent, updateTableStatus } from './restuaurant.controller.js';

const router = Router();

/**
 * @route POST /restaurantManager/v1/content/register-all
 * @desc Registro masivo de datos (JSON puro)
 */
router.post('/register-all', registerRestaurantContent);

/**
 * @route PATCH /restaurantManager/v1/content/table-status/:tableId
 * @desc Actualizar estado de una mesa
 */
router.patch('/table-status/:tableId', updateTableStatus);

export default router;