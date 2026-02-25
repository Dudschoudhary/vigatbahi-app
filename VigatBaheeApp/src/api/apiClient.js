import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Website backend runs on port 5010
// Using machine's local IP for real device testing (both phone and PC must be on same WiFi)
const BASE_URL = 'http://192.168.1.6:5010';

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

// Auth API — matches website backend routes (root-level, no /api prefix)
export const authAPI = {
    register: (data) => apiClient.post('/register', data),
    login: (data) => apiClient.post('/login', data),
    forgotPassword: (email) => apiClient.post('/forgot-password', { email }),
    resetPassword: (data) => apiClient.post('/reset-password', data),
    changePassword: (data) => apiClient.post('/change-password', data),
};

// Bahee Details API — matches website backend baheeRoutes.js
export const baheeDetailsAPI = {
    create: (data) => apiClient.post('/bahee-details', data),
    getAll: () => apiClient.get('/bahee-details'),
    getByType: (baheeType) => apiClient.get(`/bahee-details/${baheeType}`),
    update: (id, data) => apiClient.put(`/bahee-details/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-details/${id}`),
};

// Bahee Entries API — matches website backend baheeRoutes.js
export const baheeEntriesAPI = {
    create: (data) => apiClient.post('/bahee-entries', data),
    getAll: (params) => apiClient.get('/bahee-entries', { params }),
    getByTypeAndHeader: (baheeType, headerName, params) =>
        apiClient.get(`/bahee-entries/${baheeType}/${encodeURIComponent(headerName)}`, { params }),
    update: (id, data) => apiClient.put(`/bahee-entries/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-entries/${id}`),
};

// Personal Bahee API — matches website backend personalbahee.route.js
export const personalBaheeAPI = {
    create: (data) => apiClient.post('/personalbahee', data),
    getAll: (params) => apiClient.get('/personalbahee', { params }),
    getByTypeAndHeader: (baheeType, headerName, params) =>
        apiClient.get(`/personalbahee/${baheeType}/${encodeURIComponent(headerName)}`, { params }),
    update: (id, data) => apiClient.put(`/personalbahee/${id}`, data),
    delete: (id) => apiClient.delete(`/personalbahee/${id}`),
};

// Reviews API — matches website backend review.route.js
export const reviewsAPI = {
    getAll: () => apiClient.get('/reviews'),
    create: (data) => apiClient.post('/reviews', data),
    getById: (id) => apiClient.get(`/reviews/${id}`),
    update: (id, data) => apiClient.put(`/reviews/${id}`, data),
    delete: (id) => apiClient.delete(`/reviews/${id}`),
    checkAdmin: () => apiClient.get('/reviews/check-admin'),
};

export default apiClient;
