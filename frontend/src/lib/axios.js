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

// Import the useAuth store
import { useAuth } from "@/hooks/useAuth";

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops by marking this request as already retried
      originalRequest._retry = true;

      try {
        // Get the current auth state
        const { logout } = useAuth.getState();

        // Clear the auth state
        logout();

        // Clear any stored tokens
        localStorage.removeItem("auth-store");

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Error during logout:", err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
