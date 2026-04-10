import { Router } from 'express';
import { getMenu, getMenuItem, agregarAlCarrito, verCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, confirmarPedido, getPedidosByUser, getPedidosByRestaurant, getPedidoById, actualizarStatus, cancelarPedido, editarPedidoPorRestaurante } from './order.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

//los clientes puedan ver antes de hacer login
router.get('/menu/:restaurantId', getMenu);
router.get('/menu/:restaurantId/:itemId', getMenuItem);

//requiere JWT, solo el propio usuario accede
router.post('/cart/:userId', validateJWT, agregarAlCarrito);
router.get('/cart/:userId', validateJWT, verCarrito);
router.patch('/cart/:userId/:menuItemId', validateJWT, actualizarCantidad);
router.delete('/cart/:userId/:menuItemId', validateJWT, eliminarDelCarrito);
router.delete('/cart/:userId', validateJWT, vaciarCarrito);


//confirmar pedido — cliente autenticado
router.post(
    '/',
    validateJWT,
    confirmarPedido
);

//historial de pedidos del propio usuario
router.get(
    '/user/:userId',
    validateJWT,
    getPedidosByUser
);

//cola de pedidos del restaurante — solo RES_ADMIN
router.get(
    '/restaurant/:restaurantId',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    getPedidosByRestaurant
);

//detalle de un pedido — cliente ve el suyo; RES_ADMIN ve los de su restaurante
router.get(
    '/:orderId',
    validateJWT,
    getPedidoById
);

//cambiar estado — solo RES_ADMIN
router.patch(
    '/:orderId/status',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    actualizarStatus)
    ;

//editar pedido (items/notas) — solo RES_ADMIN
router.patch(
    '/:orderId/edit',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    editarPedidoPorRestaurante
);

//cancelar pedido — cliente (solo en estado Pendiente y dentro de 5 min) o RES_ADMIN
router.delete(
    '/:orderId',
    validateJWT,
    cancelarPedido
);

export default router;