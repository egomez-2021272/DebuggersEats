import { Router } from 'express';
import { getMenu, getMenuItem, agregarAlCarrito, verCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, confirmarPedido, getPedidosByUser, getPedidosByRestaurant, getPedidoById, actualizarStatus, cancelarPedido, editarPedidoPorRestaurante } from './order.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * @swagger
 * /add-restaurant/v1/orders/menu/{restaurantId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener menú de un restaurante
 *     description: Permite ver el menú sin autenticación
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menú obtenido correctamente
 */
router.get('/menu/:restaurantId', getMenu);

/**
 * @swagger
 * /add-restaurant/v1/orders/menu/{restaurantId}/{itemId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener detalle de un item del menú
 *     description: Permite ver un item específico del menú
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item obtenido correctamente
 */
router.get('/menu/:restaurantId/:itemId', getMenuItem);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}:
 *   post:
 *     tags: [Orders]
 *     summary: Agregar producto al carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/cart/:userId', validateJWT, agregarAlCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Ver carrito del usuario
 *     security:
 *       - bearerAuth: []
 */
router.get('/cart/:userId', validateJWT, verCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}/{menuItemId}:
 *   patch:
 *     tags: [Orders]
 *     summary: Actualizar cantidad de un item en el carrito
 *     security:
 *       - bearerAuth: []
 */
router.patch('/cart/:userId/:menuItemId', validateJWT, actualizarCantidad);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}/{menuItemId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Eliminar item del carrito
 *     security:
 *       - bearerAuth: []
 */
router.delete('/cart/:userId/:menuItemId', validateJWT, eliminarDelCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Vaciar carrito
 *     security:
 *       - bearerAuth: []
 */
router.delete('/cart/:userId', validateJWT, vaciarCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Confirmar pedido
 *     description: Convierte el carrito en un pedido
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateJWT, confirmarPedido);

/**
 * @swagger
 * /add-restaurant/v1/orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener pedidos del usuario
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:userId', validateJWT, getPedidosByUser);

/**
 * @swagger
 * /add-restaurant/v1/orders/restaurant/{restaurantId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener pedidos de un restaurante
 *     description: Solo accesible por administradores del restaurante
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/restaurant/:restaurantId',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    getPedidosByRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener detalle de un pedido
 *     security:
 *       - bearerAuth: []
 */
router.get('/:orderId', validateJWT, getPedidoById);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Actualizar estado del pedido
 *     description: Solo RES_ADMIN
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    '/:orderId/status',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    actualizarStatus
);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}/edit:
 *   patch:
 *     tags: [Orders]
 *     summary: Editar pedido
 *     description: Solo RES_ADMIN
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    '/:orderId/edit',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    editarPedidoPorRestaurante
);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Cancelar pedido
 *     description: Cliente o administrador
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:orderId', validateJWT, cancelarPedido);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         restaurantId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               menuItemId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *         total:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDIENTE, CONFIRMADO, EN_PROCESO, ENTREGADO, CANCELADO]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */