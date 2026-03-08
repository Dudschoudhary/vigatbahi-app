import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Production backend — runs on VPS at vigatbahi.me
// This works on ANY network — no WiFi dependency!
const BASE_URL = 'http://157.245.96.150:5010';

/**
 * Extract error message from HTML error pages returned by Express.
 * The backend returns errors as HTML like: <pre>Error: some message<br>...</pre>
 * This function extracts the human-readable message from that HTML.
 */
const extractErrorFromHTML = (html) => {
    if (typeof html !== 'string') return null;
    // Match Express default error page: <pre>Error: message<br>
    const match = html.match(/<pre>(?:Error:\s*)?(.+?)(?:<br>|<\/pre>)/i);
    if (match && match[1]) {
        return match[1].trim();
    }
    // Fallback: try to extract any text from the <pre> tag
    const preMatch = html.match(/<pre>(.+?)<\/pre>/is);
    if (preMatch && preMatch[1]) {
        // Remove HTML tags and clean up
        return preMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200);
    }
    return null;
};

/**
 * Check if a response body is HTML rather than JSON.
 */
const isHTMLResponse = (data) => {
    return typeof data === 'string' && (
        data.trim().startsWith('<!DOCTYPE') ||
        data.trim().startsWith('<html') ||
        data.trim().startsWith('<pre>')
    );
};

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
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

// Response interceptor — handle HTML errors, 401 + debug logging
apiClient.interceptors.response.use(
    (response) => {
        // Check if the successful response is actually HTML (shouldn't happen, but be safe)
        if (isHTMLResponse(response.data)) {
            console.warn('⚠️ API returned HTML instead of JSON for:', response.config.url);
            // Try to parse it as an error
            const msg = extractErrorFromHTML(response.data);
            if (msg) {
                const err = new Error(msg);
                err.response = {
                    ...response,
                    data: { message: msg, success: false },
                };
                return Promise.reject(err);
            }
        }
        const dataLen = Array.isArray(response.data?.data) ? response.data.data.length : '-';
        console.log(`🟢 API ${response.status} ${response.config.url} → ${dataLen} items`);
        return response;
    },
    async (error) => {
        const status = error.response?.status || 'NETWORK';
        const url = error.config?.url || 'unknown';

        // ── Handle HTML error responses from Express ──
        if (error.response && isHTMLResponse(error.response.data)) {
            const extractedMsg = extractErrorFromHTML(error.response.data);
            console.error(`🔴 API ${status} ${url} (HTML error):`, extractedMsg);
            const friendlyMsg = extractedMsg || 'सर्वर त्रुटि हुई';
            // Normalize the response to JSON format so all downstream code works
            error.response.data = {
                message: friendlyMsg,
                success: false,
            };
            // Also set error.message so it's accessible via err.message
            error.message = friendlyMsg;
        } else {
            console.error(`🔴 API ${status} ${url}:`, error.response?.data?.message || error.message);
        }

        // ── Handle 401 Unauthorized — clear auth state ──
        if (error.response?.status === 401) {
            console.warn('🔑 401 received — clearing stored auth tokens');
            await AsyncStorage.multiRemove(['vb_token', 'vb_user']);
        }

        // ── Handle network errors with a friendlier message ──
        if (!error.response) {
            error.message = 'सर्वर से कनेक्शन नहीं हो सका। कृपया इंटरनेट जांचें।';
        }

        return Promise.reject(error);
    }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
// Production VPS backend uses root-level routes (no /api prefix)
export const authAPI = {
    register: (data) => apiClient.post('/register', data),
    login: (data) => apiClient.post('/login', data),
    forgotPassword: (email) => apiClient.post('/forgot-password', { email }),
    resetPassword: (data) => apiClient.post('/reset-password', data),
    changePassword: (data) => apiClient.post('/change-password', data),
};

// ─── Bahee Details API ────────────────────────────────────────────────────────
// Production VPS backend routes at /bahee-details
export const baheeDetailsAPI = {
    create: (data) => apiClient.post('/bahee-details', data),
    getAll: () => apiClient.get('/bahee-details'),
    getByType: (baheeType) => apiClient.get(`/bahee-details/${baheeType}`),
    update: (id, data) => apiClient.put(`/bahee-details/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-details/${id}`),
};

// ─── Bahee Entries API ────────────────────────────────────────────────────────
// Production VPS backend routes at /bahee-entries
export const baheeEntriesAPI = {
    create: (data) => apiClient.post('/bahee-entries', data),
    getAll: (params) => apiClient.get('/bahee-entries', { params }),
    getByTypeAndHeader: (baheeType, headerName, p) =>
        apiClient.get(`/bahee-entries/${baheeType}/${encodeURIComponent(headerName)}`, { params: p }),
    update: (id, data) => apiClient.put(`/bahee-entries/${id}`, data),
    delete: (id) => apiClient.delete(`/bahee-entries/${id}`),
};

// ─── Personal Bahee API ───────────────────────────────────────────────────────
// Production VPS backend routes at /personalbahee
export const personalBaheeAPI = {
    create: (data) => apiClient.post('/personalbahee', data),
    getAll: (params) => apiClient.get('/personalbahee', { params }),
    getByTypeAndHeader: (baheeType, headerName, p) =>
        apiClient.get(`/personalbahee/${baheeType}/${encodeURIComponent(headerName)}`, { params: p }),
    update: (id, data) => apiClient.put(`/personalbahee/${id}`, data),
    delete: (id) => apiClient.delete(`/personalbahee/${id}`),
};

export default apiClient;
