// src/shared/apis/userEvents.js
import { axiosRestaurant } from './api.js';

const BASE = '/events';

/** Eventos activos de un restaurante (público, sin auth) */
export const getPublicEventsByRestaurant = (restaurantId) =>
    axiosRestaurant.get(`${BASE}/restaurant/${restaurantId}`);

/** Todos los eventos activos públicos (llamando a cada restaurante) */
export const getAllPublicEvents = async (restaurants) => {
    const results = await Promise.allSettled(
        restaurants.map((r) => axiosRestaurant.get(`${BASE}/restaurant/${r._id}`))
    );
    return results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value?.data?.data ?? []);
};

/** Inscribirse a un evento (type: 'event') */
export const joinEvent = (id) => axiosRestaurant.post(`${BASE}/${id}/join`);

/** Desinscribirse de un evento */
export const leaveEvent = (id) => axiosRestaurant.delete(`${BASE}/${id}/join`);

/** Aplicar promoción o cupón (type: 'promotion' | 'coupon') */
export const applyEvent = (id) => axiosRestaurant.post(`${BASE}/${id}/apply`);