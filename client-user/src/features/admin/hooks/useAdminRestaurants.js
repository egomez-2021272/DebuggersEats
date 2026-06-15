// client-user/src/features/admin/hooks/useAdminRestaurants.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useAdminRestaurants = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const fetchAllRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get("/restaurants");
      const data = response.data.data || response.data;
      setRestaurants(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar restaurantes");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRestaurant = useCallback(async (restaurantId) => {
    try {
      setLoading(true);
      setError(null);
      await restaurantClient.delete(`/restaurants/${restaurantId}`);
      setRestaurants((prev) => prev.filter((r) => r._id !== restaurantId));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al eliminar restaurante");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const createRestaurant = useCallback(async (restaurantData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.post("/restaurants", restaurantData);
      const data = response.data.data || response.data;
      setRestaurants((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al crear restaurante");
      return { success: false, error: err.response?.data?.message || err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRestaurant = useCallback(async (restaurantId, restaurantData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.put(`/restaurants/${restaurantId}`, restaurantData);
      const data = response.data.data || response.data;
      setRestaurants((prev) => prev.map((r) => (r._id === restaurantId ? data : r)));
      return { success: true, data };
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al actualizar restaurante");
      return { success: false, error: err.response?.data?.message || err.response?.data?.error };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    restaurants,
    loading,
    error,
    fetchAllRestaurants,
    deleteRestaurant,
    createRestaurant,
    updateRestaurant,
  };
};
