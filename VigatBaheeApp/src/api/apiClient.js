import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Production backend — runs on VPS at vigatbahi.me
// This works on ANY network — no WiFi dependency!
const BASE_URL = 'http://157.245.96.150:5010';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token + debug logging
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('vb_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`🔵 API ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params || '');
        return config;
    },
    (error) => {
        console.error('🔴 Request setup error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor — handle 401 + debug logging
apiClient.interceptors.response.use(
    (response) => {
        const dataLen = Array.isArray(response.data?.data) ? response.data.data.length : '-';
        console.log(`🟢 API ${response.status} ${response.config.url} → ${dataLen} items`);
        return response;
    },
    async (error) => {
        const status = error.response?.status || 'NETWORK';
        const url = error.config?.url || 'unknown';
        console.error(`🔴 API ${status} ${url}:`, error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
            await AsyncStorage.multiRemove(['vb_token', 'vb_user']);
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
// Website backend: user.route.js — routes at root level (no /api prefix)
export const authAPI = {
    register: (data) => apiClient.post('/register', data),
    login: (data) => apiClient.post('/login', data),
    forgotPassword: (email) => apiClient.post('/forgot-password', { email }),
    resetPassword: (data) => apiClient.post('/reset-password', data),
    changePassword: (data) => apiClient.post('/change-password', data),
};

// ─── Bahee Details API ────────────────────────────────────────────────────────
// Website backend: baheeRoutes.js — routes at /bahee-details
export const baheeDetailsAPI = {
    create: (data) => apiClient.post('/bahee-details', data),
    getAll: () => apiClient.get('/bahee-details'),
    getByType: (baheeType) => apiClient.get(`/bahee-details/${baheeType}`),
    update: (id, data) => apiClient.put(`/bahee-details/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-details/${id}`),
};

// ─── Bahee Entries API ────────────────────────────────────────────────────────
// Website backend: baheeRoutes.js — routes at /bahee-entries
export const baheeEntriesAPI = {
    create: (data) => apiClient.post('/bahee-entries', data),
    getAll: (params) => apiClient.get('/bahee-entries', { params }),
    getByTypeAndHeader: (baheeType, headerName, p) =>
        apiClient.get(`/bahee-entries/${baheeType}/${encodeURIComponent(headerName)}`, { params: p }),
    update: (id, data) => apiClient.put(`/bahee-entries/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-entries/${id}`),
};

// ─── Personal Bahee API ───────────────────────────────────────────────────────
// Website backend: personalbahee.route.js — routes at /personalbahee
export const personalBaheeAPI = {
    create: (data) => apiClient.post('/personalbahee', data),
    getAll: (params) => apiClient.get('/personalbahee', { params }),
    getByTypeAndHeader: (baheeType, headerName, p) =>
        apiClient.get(`/personalbahee/${baheeType}/${encodeURIComponent(headerName)}`, { params: p }),
    update: (id, data) => apiClient.put(`/personalbahee/${id}`, data),
    delete: (id) => apiClient.delete(`/personalbahee/${id}`),
};

export default apiClient;
