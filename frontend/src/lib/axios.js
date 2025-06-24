import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const getAuthToken = () => {
  try {
    const rawData = localStorage.getItem('auth-store');
    if (!rawData) return null;
    const parsed = JSON.parse(rawData);
    let token = parsed.state?.token || parsed.token;
    if (!token) return null;
    return token.startsWith('Bearer ') ? token.substring(7).trim() : token;
  } catch {
    return null;
  }
};

instance.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token.trim()}`;
      }
      if (
        config.url &&
        config.url.startsWith('/') &&
        config.baseURL &&
        config.baseURL.endsWith('/')
      ) {
        config.url = config.url.substring(1);
      }
    } catch {
      //pass
    }
    return config;
  },
  (error) => Promise.reject(error),
);

import { useAuth } from '@/hooks/useAuth';

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { logout } = useAuth.getState();
        logout();
        localStorage.removeItem('auth-store');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Error during logout:', err);
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
