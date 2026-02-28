import { Router } from 'express';
import {
    getMenu,
    getMenuItem,
    agregarAlCarrito,
    verCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    confirmarPedido,
    getPedidosByUser,
    getPedidosByRestaurant,
    getPedidoById,
    actualizarStatus,
    cancelarPedido
} from './order.controller.js';


const router = Router();

router.get('/menu/:restaurantId', getMenu);
router.get('/menu/:restaurantId/:itemId', getMenuItem);

//carrito en memoria
router.post('/cart/:userId', agregarAlCarrito);
router.get('/cart/:userId', verCarrito);
router.patch('/cart/:userId/:menuItemId', actualizarCantidad);
router.delete('/cart/:userId/:menuItemId', eliminarDelCarrito);
router.delete('/cart/:userId', vaciarCarrito);

//pedidos
router.post('/', confirmarPedido);
router.get('/user/:userId', getPedidosByUser);
router.get('/restaurant/:restaurantId', getPedidosByRestaurant);
router.get('/:orderId', getPedidoById);
router.patch('/:orderId/status', actualizarStatus);
router.delete('/:orderId', cancelarPedido);

export default router;