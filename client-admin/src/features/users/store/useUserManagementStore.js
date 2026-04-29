import { create } from 'zustand';
import {
    getAllUsers as getAllUsersRequest,
    toggleUserStatus as toggleStatusRequest,
    deleteUser as deleteUserRequest,
} from '../../../shared/apis';

export const useUserManagementStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,
    filters: {},

    setFilters: (filters) => set({ filters }),

    setUser: (users) => set({ users }),

    getAllUsers: async (apiFn = getAllUsersRequest, options = {}) => {
        try {
            const { force = false } = options;
            const state = get();

            if (state.loading) return;
            if (!force && state.users.length > 0) return;

            set({ loading: true, error: null });

            const fetcher = typeof apiFn === 'function' ? apiFn : getAllUsersRequest;
            const response = await fetcher();

            set({
                users: response.data.data || [],
                loading: false,
            });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Error al listar usuarios',
                loading: false,
            });
        }
    },

    toggleUserStatus: async (id) => {
        try {
            set({ loading: true, error: null });
            const response = await toggleStatusRequest(id);
            set({
                users: get().users.map((u) =>
                    u._id === id ? response.data.data : u
                ),
                loading: false,
            });
            return { success: true };
        } catch (err) {
            set({
                loading: false,
                error: err.response?.data?.message || 'Error al cambiar estado del usuario',
            });
            return { success: false };
        }
    },

    deleteUser: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteUserRequest(id);
            set({
                users: get().users.filter((u) => u._id !== id),
                loading: false,
            });
            return { success: true };
        } catch (err) {
            set({
                loading: false,
                error: err.response?.data?.message || 'Error al eliminar usuario',
            });
            return { success: false };
        }
    },
}));