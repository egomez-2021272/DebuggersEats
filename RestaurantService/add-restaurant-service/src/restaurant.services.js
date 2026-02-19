import Restaurant from './restaurant.model.js';

export const createRestaurantRecord = async ({ restaurantData, userId }) => {

    const restaurant = new Restaurant({
        ...restaurantData,
        createdBy: userId
    });

    await restaurant.save();

    return restaurant;
};
