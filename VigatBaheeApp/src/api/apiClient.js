import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Android emulator use 10.0.2.2, for real device use your machine's local IP
const BASE_URL = 'http://10.0.2.2:5000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('vb_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.multiRemove(['vb_token', 'vb_user']);
            // Navigation handled by AuthContext listener
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => apiClient.post('/auth/register', data),
    login: (data) => apiClient.post('/auth/login', data),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (data) => apiClient.post('/auth/reset-password', data),
    getMe: () => apiClient.get('/auth/me'),
    changePassword: (data) => apiClient.put('/auth/change-password', data),
};

// Bahee Details API
export const baheeDetailsAPI = {
    create: (data) => apiClient.post('/bahee-details', data),
    getAll: () => apiClient.get('/bahee-details'),
    getByType: (baheeType) => apiClient.get(`/bahee-details/type/${baheeType}`),
    update: (id, data) => apiClient.put(`/bahee-details/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-details/${id}`),
};

// Bahee Entries API
export const baheeEntriesAPI = {
    create: (data) => apiClient.post('/bahee-entries', data),
    getAll: (params) => apiClient.get('/bahee-entries', { params }),
    getByTypeAndHeader: (baheeType, headerName, params) =>
        apiClient.get(`/bahee-entries/${baheeType}/${encodeURIComponent(headerName)}`, { params }),
    update: (id, data) => apiClient.put(`/bahee-entries/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-entries/${id}`),
    toggleLock: (id, data) => apiClient.put(`/bahee-entries/${id}/lock`, data),
};

// Personal Bahee API
export const personalBaheeAPI = {
    create: (data) => apiClient.post('/personal-bahee', data),
    getAll: (params) => apiClient.get('/personal-bahee', { params }),
    update: (id, data) => apiClient.put(`/personal-bahee/${id}`, data),
    delete: (id) => apiClient.delete(`/personal-bahee/${id}`),
    toggleLock: (id, data) => apiClient.put(`/personal-bahee/${id}/lock`, data),
};

export default apiClient;
