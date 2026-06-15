// client-user/src/shared/api/authClient.js

import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";
import * as SecureStore from "expo-secure-store";

const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH,
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

authClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      error.response.data?.message === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
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
            return authClient(originalRequest);
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

        const data = response.data.data || response.data;
        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken || refreshToken;
        const userDetails = data.userDetails || data.user;

        useAuthStore.getState().setAccessToken(newAccessToken);

        if (userDetails) {
          useAuthStore.getState().updateUser(userDetails);
        }

        if (newRefreshToken !== refreshToken) {
          await SecureStore.setItemAsync("dbe_refresh_token", newRefreshToken);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return authClient(originalRequest);
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

export default authClient;
