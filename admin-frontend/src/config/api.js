// API Configuration
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for sending cookies (refresh token)
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint
                const response = await axios.post(`${API_BASE_URL}/api/admin/refresh`, {}, { withCredentials: true });
                
                if (response.data.success) {
                    const { token } = response.data;
                    localStorage.setItem('adminToken', token);
                    
                    // Update header and retry original request
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear token and redirect to login
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
