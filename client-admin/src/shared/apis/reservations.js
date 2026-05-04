// src/shared/apis/reservations.js
import { axiosRestaurant } from './api.js';

const BASE = '/reservations';

/** Reservaciones del usuario autenticado */
export const getMyReservations = () => axiosRestaurant.get(BASE);

/** Reservaciones de un restaurante (RES_ADMIN_ROLE) */
export const getReservationsByRestaurant = (restaurantName, params = {}) =>
  axiosRestaurant.get(`${BASE}/restaurant/${encodeURIComponent(restaurantName)}`, { params });

/** Crear reservación */
export const createReservation = (data) => axiosRestaurant.post(BASE, data);

/** Actualizar reservación */
export const updateReservation = (id, data) => axiosRestaurant.put(`${BASE}/${id}`, data);

/** Eliminar reservación */
export const deleteReservation = (id) => axiosRestaurant.delete(`${BASE}/${id}`);

/** Confirmar o cancelar con token */
export const confirmOrCancel = (token, action) =>
  axiosRestaurant.post(`${BASE}/confirm`, { token, action });

/** Verificar disponibilidad de mesas */
export const checkDisponibilidad = (restaurantName, date, hour) =>
  axiosRestaurant.get(`${BASE}/disponibilidad/${encodeURIComponent(restaurantName)}`, {
    params: { date, hour },
  });

/** Mesas de un restaurante */
export const getTablesByRestaurant = (restaurantId) =>
  axiosRestaurant.get(`/tables/restaurant/${restaurantId}`);
