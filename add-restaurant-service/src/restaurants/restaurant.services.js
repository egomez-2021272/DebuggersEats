import Restaurant from './restaurant.model.js';
import { uploadImage, deleteImage, getFullImageUrl } from '../../helpers/cloudinary-service.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const RESTAURANT_FOLDER = process.env.CLOUDINARY_RESTAURANTS_FOLDER || 'restaurants';

export const createRestaurantRecord = async ({ restaurantData, userId, file }) => {
    console.log('FILE RECIBIDO:', file);
    const restaurant = new Restaurant({
        ...restaurantData,
        createdBy: userId
    });

    await restaurant.save();

    // Si viene foto, subirla a Cloudinary
    if (file) {
        const fileName = `restaurant-${uuidv4()}${path.extname(file.originalname)}`;
        await uploadImage(file.path, fileName, RESTAURANT_FOLDER);
        restaurant.photo = fileName;
        await restaurant.save();
    }

    return {
        ...restaurant.toObject(),
        photoUrl: restaurant.photo ? getFullImageUrl(restaurant.photo, RESTAURANT_FOLDER) : null
    };

    

    
};


export const getAllRestaurantsRecord = async () => {
    return Restaurant.find().sort({ createdAt: -1 });
};

export const getRestaurantByName = async (name) => {
    return Restaurant.findOne({ name: name.trim() });
};

export const uploadRestaurantPhotoService = async ({ restaurantId, file }) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurante no encontrado');

    // Eliminar foto anterior en Cloudinary si existe
    if (restaurant.photo) {
        await deleteImage(restaurant.photo, RESTAURANT_FOLDER);
    }

    const fileName = `restaurant-${uuidv4()}${path.extname(file.originalname)}`;
    await uploadImage(file.path, fileName, RESTAURANT_FOLDER);

    restaurant.photo = fileName;
    await restaurant.save();

    return {
        ...restaurant.toObject(),
        photoUrl: getFullImageUrl(fileName, RESTAURANT_FOLDER)
    };
};

export const deleteRestaurantPhotoService = async (restaurantId) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurante no encontrado');

    if (restaurant.photo) {
        await deleteImage(restaurant.photo, RESTAURANT_FOLDER);
        restaurant.photo = null;
        await restaurant.save();
    }

    return restaurant;
};
