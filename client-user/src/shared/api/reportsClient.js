// client-user/src/shared/api/reportsClient.js

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const reportsClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_REPORTS_URL || "http://192.168.1.244:5000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

reportsClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

reportsClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_AUTH_URL}/auth/refresh`,
            { refreshToken }
          );
          const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
          useAuthStore.getState().setAccessToken(accessToken);
          useAuthStore.getState().updateUser({ refreshToken: newRefreshToken });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return reportsClient(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default reportsClient;
