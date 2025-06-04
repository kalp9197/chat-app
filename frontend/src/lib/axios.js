import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Helper function to extract auth token from localStorage
const getAuthToken = () => {
  try {
    const rawData = localStorage.getItem('auth-store');
    
    if (!rawData) return null;
    
    const parsed = JSON.parse(rawData);
    
    let token = null;
    
    // Check state first (Zustand persist pattern)
    if (parsed.state && parsed.state.token) {
      token = parsed.state.token;
    }
    // Alternative location
    else if (parsed.token) {
      token = parsed.token;
    }
    
    if (!token) return null;
    
    // Clean the token to ensure it doesn't already have 'Bearer '
    if (token.startsWith('Bearer ')) {
      token = token.substring(7).trim(); // Remove 'Bearer ' prefix
    }
    
    return token;
  } catch {
    // Silently handle errors
    return null;
  }
};

// Request interceptor to add authentication token
instance.interceptors.request.use(
  (config) => {
    try {
      // Get the token directly using our helper
      const token = getAuthToken();
      
      // Only proceed with token if we have one
      if (token) {
        // Ensure headers object exists
        config.headers = config.headers || {};
        
        // Set Authorization header with proper Bearer format
        config.headers['Authorization'] = 'Bearer ' + token.trim();
      }
      
      // Fix URL if it has double slashes due to baseURL configuration
      if (config.url.startsWith('/') && config.baseURL.endsWith('/')) {
        config.url = config.url.substring(1);
      }
    } catch {
      // Silent fail to prevent request interruption
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // For 401 errors, you could add auto-redirect logic
    // if (error.response && error.response.status === 401) {
    //   window.location.href = '/login';
    // }
    
    return Promise.reject(error);
  }
);

export default instance;
