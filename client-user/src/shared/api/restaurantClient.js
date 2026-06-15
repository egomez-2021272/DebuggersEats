// client-user/src/shared/api/restaurantClient.js

import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from "expo-secure-store";

const restaurantClient = axios.create({
  baseURL: ENDPOINTS.RESTAURANT,
  timeout: 8000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const noRefreshUrls = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/activate",
];

restaurantClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

restaurantClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const data = error.response?.data;

    // Detecta token expirado sin importar el formato que use el backend:
    // - auth server:            { error: "TOKEN_EXPIRED" }
    // - restaurant service:     { message: "Token inválido", detail: "jwt expired" }
    const isTokenExpired =
      (status === 401 || status === 403) &&
      (
        data?.error === "TOKEN_EXPIRED" ||
        data?.message === "TOKEN_EXPIRED" ||
        data?.detail?.includes("jwt expired") ||
        data?.detail?.includes("expired")
      );

    if (isTokenExpired && !originalRequest._retry) {
      const shouldSkipRefresh = noRefreshUrls.some((url) =>
        originalRequest.url?.includes(url)
      );

      if (shouldSkipRefresh) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return restaurantClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("dbe_refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${ENDPOINTS.AUTH}/auth/refresh`,
          { refreshToken }
        );

        const resData = response.data.data || response.data;
        const newAccessToken = resData.accessToken || resData.token;
        const newRefreshToken = resData.refreshToken || refreshToken;
        const userDetails = resData.userDetails || resData.user;

        useAuthStore.getState().setAccessToken(newAccessToken);

        if (userDetails) {
          useAuthStore.getState().updateUser(userDetails);
        }

        if (newRefreshToken !== refreshToken) {
          await SecureStore.setItemAsync("dbe_refresh_token", newRefreshToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return restaurantClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default restaurantClient;