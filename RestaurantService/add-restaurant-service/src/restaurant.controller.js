import { createRestaurantRecord } from './restaurant.services.js';

export const createRestaurant = async (req, res) => {
    try {

        const restaurant = await createRestaurantRecord({
            restaurantData: req.body,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Restaurante registrado exitosamente',
            data: restaurant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el restaurante',
            error: error.message
        });
    }
};
