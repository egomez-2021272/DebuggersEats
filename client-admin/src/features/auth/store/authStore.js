import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    login as loginRequest,
    register as registerRequest,
} from '../../../shared/apis';
import { showError } from '../../../shared/utils/toast.js';

const ALLOWED_ROLES = ['ADMIN_ROLE', 'RES_ADMIN_ROLE', 'USER_ROLE'];

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,

            checkAuth: () => {
                const token = get().token;
                const role = get().user?.role;
                const hasAccess = ALLOWED_ROLES.includes(role);

                if (token && !hasAccess) {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        expiresAt: null,
                        isLoadingAuth: true,
                        isAuthenticated: false,
                        error: 'No tienes permiso para acceder a esta aplicación',
                    });
                    return;
                }

                set({
                    isLoadingAuth: false,
                    isAuthenticated: Boolean(token) && hasAccess,
                });
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            login: async ({ username, password }) => {
                try {
                    set({ loading: true, error: null });

                    const { data } = await loginRequest({ username, password });
                    const role = data?.data?.user?.role;

                    if (!ALLOWED_ROLES.includes(role)) {
                        const message = 'No tienes permiso para acceder a esta aplicación';
                        set({
                            user: null,
                            token: null,
                            refreshToken: null,
                            expiresAt: null,
                            isLoadingAuth: true,
                            isAuthenticated: false,
                            error: message,
                        });
                        showError(message);
                        return { success: false, error: message };
                    }

                    set({
                        user: data.data.user,
                        token: data.data.token,
                        refreshToken: null,
                        expiresAt: null,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });

                    return { success: true, role };
                } catch (err) {
                    const message = err.response?.data?.error || err.response?.data?.message || 'Error al iniciar sesión';
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

            register: async (formData) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await registerRequest(formData);
                    set({ loading: false });
                    return {
                        success: true,
                        emailVerificationRequired: data?.emailVerificationRequired,
                        data,
                    };
                } catch (err) {
                    const message = err.response?.data?.error || err.response?.data?.message || 'Error al registrar cuenta';
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },
        }),
        { name: 'auth-DBE-admin' },
    ),
);