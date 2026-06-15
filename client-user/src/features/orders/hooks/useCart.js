// client-user/src/features/orders/hooks/useCart.js

import { useState, useCallback } from "react";
import restaurantClient from "../../../shared/api/restaurantClient";

export const useCart = () => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, iva: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantClient.get(`/orders/cart/${userId}`);
      // El backend puede devolver null cuando el carrito está vacío — eso no es error
      const data = response.data.data ?? { items: [], subtotal: 0, iva: 0, total: 0 };
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al cargar carrito");
    } finally {
      setLoading(false);
    }
  }, []);

  // FIX: la firma correcta es addToCart(userId, menuItemId, cantidad, aditamentos)
  // El backend espera POST /orders/cart/:userId con body { menuItemId, cantidad, aditamentos }
  const addToCart = useCallback(
    async (userId, menuItemId, cantidad = 1, aditamentos = []) => {
      if (!userId) throw new Error("userId requerido");
      try {
        setLoading(true);
        setError(null);
        const response = await restaurantClient.post(`/orders/cart/${userId}`, {
          menuItemId,
          cantidad,
          aditamentos,
        });
        const data = response.data.data ?? { items: [], subtotal: 0, iva: 0, total: 0 };
        setCart(data);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al agregar al carrito";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateCartItem = useCallback(
    async (userId, menuItemId, cantidad) => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        await restaurantClient.patch(`/orders/cart/${userId}/${menuItemId}`, { cantidad });
        await fetchCart(userId);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Error al actualizar ítem");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart]
  );

  const removeCartItem = useCallback(
    async (userId, menuItemId) => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        await restaurantClient.delete(`/orders/cart/${userId}/${menuItemId}`);
        await fetchCart(userId);
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Error al eliminar ítem");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCart]
  );

  const clearCart = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      await restaurantClient.delete(`/orders/cart/${userId}`);
      setCart({ items: [], subtotal: 0, iva: 0, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Error al vaciar carrito");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  return {
    cart,
    cartCount,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };
};