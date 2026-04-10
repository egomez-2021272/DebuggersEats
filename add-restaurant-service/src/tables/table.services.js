import Table from './table.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createTableRecord = async ({ tableData, userId }) => {
    //verificar que el restaurante existe y pertenece al RES_ADMIN
    const restaurant = await Restaurant.findById(tableData.restaurantId);
    if (!restaurant) {
        const e = new Error('Restaurante no encontrado');
        e.statusCode = 404;
        throw e;
    }

    if (restaurant.createdBy.toString() !== userId) {
        const e = new Error('No tienes permisos para agregar mesas a este restaurante');
        e.statusCode = 403;
        throw e;
    }

    const table = new Table({ ...tableData });
    await table.save();
    return table;
};//createTableRecord

export const getTablesByRestaurantRecord = async (restaurantId) => {
    return Table.find({ restaurantId }).sort({ tableNumber: 1 });
};//getTablesByRestaurantRecord

export const getTableByIdRecord = async (tableId) => {
    const table = await Table.findById(tableId);
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }
    return table;
};//getTableByIdRecord

export const updateTableRecord = async ({ tableId, userId, data }) => {
    const table = await Table.findById(tableId).populate('restaurantId');
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }

    if (table.restaurantId.createdBy.toString() !== userId) {
        const e = new Error('No tienes permisos para editar esta mesa');
        e.statusCode = 403;
        throw e;
    }

    //no se permite cambiar el restaurante de una mesa
    const { restaurantId: _rid, ...safeData } = data;

    Object.assign(table, safeData);
    await table.save();
    return table;
};//updateTableRecord

export const toggleTableStatusRecord = async ({ tableId, userId }) => {
    const table = await Table.findById(tableId).populate('restaurantId');
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }

    if (table.restaurantId.createdBy.toString() !== userId) {
        const e = new Error('No tienes permisos para modificar esta mesa');
        e.statusCode = 403;
        throw e;
    }

    table.isActive = !table.isActive;
    await table.save();
    return table;
};//toggleTableStatusRecord

export const deleteTableRecord = async ({ tableId, userId }) => {
    const table = await Table.findById(tableId).populate('restaurantId');
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }

    if (table.restaurantId.createdBy.toString() !== userId) {
        const e = new Error('No tienes permisos para eliminar esta mesa');
        e.statusCode = 403;
        throw e;
    }

    await Table.deleteOne({ _id: tableId });
    return { deleted: true, tableId };
};//deleteTableRecord
