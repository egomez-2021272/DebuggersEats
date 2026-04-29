import { useRestaurantStore } from "../store/restaurantStore";

export const useSaveRestaurant = () => {
    const createRestaurant = useRestaurantStore((state) => state.createRestaurant);
    const updateRestaurant = useRestaurantStore((state) => state.updateRestaurant);

    const saveRestaurant = async (data, restaurantId = null) => {
        if (restaurantId) {
            const payload = {
                name: data.name,
                capacity: Number(data.capacity),
                address: data.address,
                phone: data.phone,
                category: data.category,
                businessHours: {
                    open: data.businessHoursOpen,
                    close: data.businessHoursClose,
                },
                contactInfo: {
                    managerName: data.managerName || undefined,
                    email: data.contactEmail || undefined,
                },
            };
            await updateRestaurant(restaurantId, payload);
        } else {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("capacity", Number(data.capacity));
            formData.append("address", data.address);
            formData.append("phone", data.phone);
            formData.append("category", data.category);
            if (data.businessHoursOpen) formData.append("businessHours[open]", data.businessHoursOpen);
            if (data.businessHoursClose) formData.append("businessHours[close]", data.businessHoursClose);
            if (data.managerName) formData.append("contactInfo[managerName]", data.managerName);
            if (data.contactEmail) formData.append("contactInfo[email]", data.contactEmail);
            if (data.photo?.length > 0) formData.append("photo", data.photo[0]);

            await createRestaurant(formData);
        }
    };

    return { saveRestaurant };
};
