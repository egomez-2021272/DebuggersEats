import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore.js';

//Crear instancias de axios para cada servicio
const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json'
    }
});

//INTERCEPTORES DE TOKENS
axiosAuth.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


const handleUnauthorized = (error) => {
    const status = error.response?.status;
    if (status === 401) {
        useAuthStore.getState().logout();
    }
    return Promise.reject(error);
};



export { axiosAuth };
