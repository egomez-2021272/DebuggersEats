import Table from '../restaurant/table.model.js';
import MenuItem from '../restaurant/menuItem.model.js';
import RestaurantDetails from '../restaurant/restaurantDetails.model.js';

// Registro inicial masivo: Detalles, Menú y Mesas
export const registerRestaurantContent = async (req, res) => {
    const { restaurantId, details, menu, tables } = req.body;

    try {
        // 1. Guardar detalles de ubicación y contacto
        const newDetails = await RestaurantDetails.create({ restaurantId, ...details });

        // 2. Mapear y guardar ítems del menú
        const menuItems = menu.map(item => ({ restaurantId, ...item }));
        const savedMenu = await MenuItem.insertMany(menuItems);

        // 3. Mapear y guardar mesas
        const tableItems = tables.map(t => ({ restaurantId, ...t }));
        const savedTables = await Table.insertMany(tableItems);

        res.status(201).json({
            success: true,
            message: 'Contenido del restaurante registrado exitosamente',
            data: { newDetails, savedMenu, savedTables }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al registrar contenido del restaurante', 
            error: error.message 
        });
    }
};

// Actualizar el estado de una mesa específica
export const updateTableStatus = async (req, res) => {
    const { tableId } = req.params;
    const { status } = req.body; 
    
    try {
        const updatedTable = await Table.findByIdAndUpdate(
            tableId,
            { status },
            { new: true }
        );
        
        if (!updatedTable) {
            return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
        }

        res.json({
            success: true,
            message: `Mesa actualizada a: ${status}`, 
            data: updatedTable
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar el estado de la mesa', 
            error: error.message 
        });
    }
};