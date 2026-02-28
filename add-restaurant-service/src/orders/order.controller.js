import Order from './order.model.js';
import MenuItem from '../menu/menu.model.js';
import * as CartService from '../orders/cart.service.js'

//devuelve el menu del restaurante
export const getMenu = async (req, res) => {
    const { restaurantId } = req.params;
    const { category } = req.query;

    try {
        const filter = { restaurantId, available: true }; //muestra platillos dispobibles
        if (category) filter.category = category;
        const menu = await MenuItem.find(filter).sort({ category: 1, name: 1 });

        res.json({
            message: 'Menu obtenido con exito',
            total: menu.length,
            data: menu,
        });

    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el menu', err: err.message });
    }
};

//devuelve un platillo específico con sus aditamentos disponible
export const getMenuItem = async (req, res) => {
    const { restaurantId, itemId } = req.params;

    try {
        const item = await MenuItem.findOne({ _id: itemId, restaurantId, available: true });
        if (!item) {
            return res.status(404).json({
                message: 'Platillo no encontrado o no disponible'
            });
        }
        res.json({ data: item });
    } catch (err) {
        res.status(500).json({
            message: 'error al obtener el platillo',
            err: err.message
        });
    }
};

//agregar un menu al carrito del usuario
export const agregarAlCarrito = async (req, res) => {
    const { userId } = req.params;
    const { menuItemId, cantidad, aditamentos } = req.body;

    if (!menuItemId || !cantidad || cantidad < 1) {
        return res.status(400).json({
            message: 'menuItemId y cantidad son necesarios'
        });
    }

    try {
        //se busca el platillo para obtener el precio y validar que existe
        const item = await MenuItem.findOne({ _id: menuItemId, available: true });
        if (!item) {
            return res.status(404).json({ message: 'Platillo o menu no disponible' });
        }

        const carrito = CartService.agregarAlCarrito(userId, item.restaurantId, {
            menuItemId: item.id,
            nombre: item.name,
            precio: item.price,
            cantidad,
            aditamentos: aditamentos || [],
        });
        res.status(201).json({ message: 'Menu agregado al carrito', data: carrito });

    } catch (err) {
        res.status(500).json({ message: 'Error al agregar al carrito', err: err.message })
    }
};

//ver carrito actual
export const verCarrito = (req, res) => {
    const { userId } = req.params;
    const carrito = CartService.obtenerCarrito(userId);

    if (!carrito) {
        return res.json({ message: 'El carrito está vacío', data: null });
    }

    res.json({ data: carrito });
};

//cambia la cantidad de un menu en el carrito - si es 0 se elimina el menu automaticamente
export const actualizarCantidad = (req, res) => {
    const { userId, menuItemId } = req.params;
    const { cantidad } = req.body;

    if (cantidad === undefined || cantidad < 0) {
        return res.status(400).json({ message: 'Debes enviar una cantidad válida (>= 0)' });
    }

    const carrito = CartService.actualizarCantidad(userId, menuItemId, cantidad);
    if (!carrito) {
        return res.status(404).json({ message: 'Carrito o platillo no encontrado' });
    }

    const mensaje = cantidad === 0 ? 'Platillo eliminado del carrito' : 'Cantidad actualizada';
    res.json({ message: mensaje, data: carrito });
};


//se elimina un menu especifico del carrito
export const eliminarDelCarrito = (req, res) => {
    const { userId, menuItemId } = req.params;
    const carrito = CartService.eliminarDelCarrito(userId, menuItemId);

    if (!carrito) {
        return res.status(404).json({ message: 'Carrito o platillo no encontrado' });
    }

    res.json({ message: 'Platillo eliminado del carrito', data: carrito });
};

export const vaciarCarrito = (req, res) => {
    const { userId } = req.params;
    CartService.vaciarCarrito(userId);
    res.json({ message: 'Carrito vaciado exitosamente' });
};

//pedidos, paso final del flujo del cliente
//confirma el carrito y crea una orden formal en mongo db

export const confirmarPedido = async (req, res) => {
    const { userId, direccion, telefono, tipoPago, notas } = req.body;

    if (!userId || !direccion || !telefono || !tipoPago) {
        return res.status(400).json({
            message: 'Falta campos requeridos'
        });
    }

    //obtener el carrito del usuario
    const carrito = CartService.obtenerItemsParaOrden(userId);
    if (!carrito || carrito.items.length == 0) {
        return res.status(400).json({ message: 'El carrito está vacio. Agrega menus antes de confirmar' });

    }

    try {
        //se valida precios contra la DB en el momento de confirmar
        const itemsValidos = [];
        for(const cartItem of carrito.items){
            const itemDB = await MenuItem.findOne({_id: cartItem.menuItemId, available: true});

            if(!itemDB){
                return res.status(409).json({
                    message: `El platillo "${cartItem.nombre}" ya no esta disponible. Por favor actualiza tu carro`,
                });
            }
            itemsValidos.push({
                menuItemId: itemDB._id,
                nombre: itemDB.name,
                precio: itemDB.price,
                cantidad: cartItem.cantidad,
                aditamentos: cartItem.aditamentos,
                subtotal: parseFloat((itemDB.price * cartItem.cantidad).toFixed(2)),
            });
        }

        //crear la orden
        const order = new Order({
            restaurantId: carrito.restaurantId,
            userId,
            items: itemsValidos,
            direccion,
            telefono,
            tipoPago,
            notas: notas || '',
            estimadoEntrega: '30-45 minutos',
            status: 'Pendiente'
        });

        await order.save();

        CartService.vaciarCarrito(userId);

        res.status(201).json({
            message: 'Pedido confirmado exitosamente',
            data: {
                orderId: order._id,
                status: order.status,
                estimadoEntrega: order.estimadoEntrega,
                subtotal: order.subtotal,
                iva: order.iva,
                total: order.total,
                tipoPago: order.tipoPago,
                items: order.items,
            },
        });

    } catch (err) {
        res.status(500).json({ message: 'Error al confirmar el pedido', err: err.message});
    }
};

//historail de pedidos de un usuario
export const getPedidosByUser = async (req, res) =>{
    const { userId} = req.params;
    const { status } = req.query;

    try {
        const filter = { userId };
        if (status) filter.status = status;

        const orders = await Order.find(filter).sort({ createdAt: -1});//orden - más reciente primas
        res.json({ total: orders.length, data: orders});
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pedidos del usuario', err: err.message});
    }
};

//lo que el restaurante ve en su panel - cola de pedidos
export const getPedidosByRestaurant = async(req, res) =>{
    const { restaurantId } = req.params;
    const { status, todos } = req.query;
    
    try {
        let filter = { restaurantId };
        if(status){
            filter.status = status;

        }else if(!todos){
            //solo se muestra pedidos activpod
            filter.status = { $nin: ['Entregado', 'Cancelado']};
        }

        const orders = await Order.find(filter).sort({ createdAt: 1});
        res.json({ total: orders.length, data: orders});
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pedidos del restaurante', err: err.message});
    }
};

// detalle de un pedido en concreto
export const getPedidoById = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        res.json({ data: order });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el pedido', err: err.message });
    }
};

// enum: ['Pendiente', 'En_preparación', 'Aceptado', 'Listo', 'Entregado', 'Cancelado'],

export const actualizarStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status }  = req.body;

    const transicionesValidas = {
        'Pendiente': ['Aceptado', 'Cancelado'],
        'Aceptado':  ['En_preparación', 'Cancelado'],
        'En_preparación': ['Listo'],
        'Listo': ['Entregado'],
        'Entregado': [],
        'Cancelado': [],
    };

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const permitidos = transicionesValidas[order.status];
        if (!permitidos.includes(status)) {
            return res.status(400).json({
                message: `Transición inválida: ${order.status} → ${status}`,
                transicionesPermitidas: permitidos,
            });
        }

        order.status = status;
        await order.save(); 

        res.json({
            message: `Pedido actualizado a ${status}`,
            data: {
                orderId:  order._id,
                status:   order.status,
                historial: order.historialStatus,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el pedido', error: error.message });
    }
};

//se cancela un pedido con su estado pendiente o aceptado
export const cancelarPedido = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        if (!['Pendiente', 'Aceptado'].includes(order.status)) {
            return res.status(400).json({
                message: `No se puede cancelar un pedido en estado ${order.status}`,
            });
        }

        order.status = 'Cancelado';
        await order.save();

        res.json({ message: 'Pedido cancelado exitosamente', data: order });
    } catch (error) {
        res.status(500).json({ message: 'Error al cancelar el pedido', error: error.message });
    }
};


