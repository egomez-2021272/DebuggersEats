import { Router } from 'express';
import { createTable, getTablesByRestaurant, getTableById, updateTable, toggleTableStatus, deleteTable } from './table.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * @swagger
 * /add-restaurant/v1/tables/restaurant/{restaurantId}:
 *   get:
 *     tags: [Tables]
 *     summary: Obtener mesas de un restaurante
 *     description: Permite a usuarios autenticados ver las mesas disponibles de un restaurante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *     responses:
 *       200:
 *         description: Mesas obtenidas correctamente
 *       401:
 *         description: No autorizado
 */
router.get(
    '/restaurant/:restaurantId',
    validateJWT,
    getTablesByRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}:
 *   get:
 *     tags: [Tables]
 *     summary: Obtener una mesa por ID
 *     description: Devuelve la información de una mesa específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     responses:
 *       200:
 *         description: Mesa obtenida correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Mesa no encontrada
 */
router.get(
    '/:id',
    validateJWT,
    getTableById
);

/**
 * @swagger
 * /add-restaurant/v1/tables:
 *   post:
 *     tags: [Tables]
 *     summary: Crear una nueva mesa
 *     description: Solo administradores de restaurante pueden crear mesas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - tableNumber
 *               - capacity
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 description: ID del restaurante
 *               tableNumber:
 *                 type: number
 *                 description: Número de mesa
 *                 example: 5
 *               capacity:
 *                 type: number
 *                 description: Capacidad de personas
 *                 example: 4
 *               status:
 *                 type: boolean
 *                 description: Estado de la mesa (activa/inactiva)
 *                 example: true
 *     responses:
 *       201:
 *         description: Mesa creada correctamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 */
router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    createTable
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}:
 *   patch:
 *     tags: [Tables]
 *     summary: Actualizar una mesa
 *     description: Solo administradores pueden modificar mesas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: number
 *               capacity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Mesa actualizada correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mesa no encontrada
 */
router.patch(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    updateTable
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}/status:
 *   patch:
 *     tags: [Tables]
 *     summary: Cambiar estado de una mesa
 *     description: Activa o desactiva una mesa (solo RES_ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mesa no encontrada
 */
router.patch(
    '/:id/status',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    toggleTableStatus
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}:
 *   delete:
 *     tags: [Tables]
 *     summary: Eliminar una mesa
 *     description: Solo administradores pueden eliminar mesas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *     responses:
 *       200:
 *         description: Mesa eliminada correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Mesa no encontrada
 */
router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteTable
);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         restaurantId:
 *           type: string
 *         tableNumber:
 *           type: number
 *         capacity:
 *           type: number
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */