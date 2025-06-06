import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Extract token from localStorage with fallback locations
const getAuthToken = () => {
  try {
    const rawData = localStorage.getItem("auth-store");
    if (!rawData) return null;

    const parsed = JSON.parse(rawData);
    let token = parsed.state?.token || parsed.token;

    if (!token) return null;

    // Remove existing Bearer prefix if present
    return token.startsWith("Bearer ") ? token.substring(7).trim() : token;
  } catch {
    return null;
  }
};

// Auto-inject auth token
instance.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token.trim()}`;
      }

      // Fix double slash in URLs
      if (
        config.url &&
        config.url.startsWith("/") &&
        config.baseURL &&
        config.baseURL.endsWith("/")
      ) {
        config.url = config.url.substring(1);
      }
    } catch {
      // Silent fail
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-redirect on 401 could be added here
    return Promise.reject(error);
  }
);

export default instance;
