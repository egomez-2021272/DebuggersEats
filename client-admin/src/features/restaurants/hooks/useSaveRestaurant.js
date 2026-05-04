import { useRestaurantStore } from '../store/restaurantStore';

export const useSaveRestaurant = () => {
  const createRestaurant = useRestaurantStore((state) => state.createRestaurant);
  const updateRestaurant = useRestaurantStore((state) => state.updateRestaurant);

  const saveRestaurant = async (formData, restaurantId = null) => {
    try {
      if (restaurantId) {
        const payload = {
          name: formData.get('name'),
          capacity: Number(formData.get('capacity')),
          address: formData.get('address'),
          phone: formData.get('phone'),
          category: formData.get('category'),
          businessHours: {
            open: formData.get('businessHoursOpen'),
            close: formData.get('businessHoursClose'),
          },
          contactInfo: {
            managerName: formData.get('managerName') || undefined,
            email: formData.get('contactEmail') || undefined,
          },
        };
        await updateRestaurant(restaurantId, payload);
      } else {
        await createRestaurant(formData);
      }
      return true;
    } catch {
      return false;
    }
  };

  return { saveRestaurant };
};
