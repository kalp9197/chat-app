import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// get auth token from storage
const getAuthToken = () => {
  try {
    const rawData = localStorage.getItem('auth-store');
    
    if (!rawData) return null;
    
    const parsed = JSON.parse(rawData);
    
    let token = null;
    
    // token in persisted state
    if (parsed.state && parsed.state.token) {
      token = parsed.state.token;
    }
    // legacy location
    else if (parsed.token) {
      token = parsed.token;
    }
    
    if (!token) return null;
    
    // strip Bearer prefix
    if (token.startsWith('Bearer ')) {
      token = token.substring(7).trim(); // Remove 'Bearer ' prefix
    }
    
    return token;
  } catch {
    // ignore errors
    return null;
  }
};

// add auth token
instance.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      // only add header if token exists
      if (token) {
        config.headers = config.headers || {};
        // set Authorization header
        config.headers['Authorization'] = 'Bearer ' + token.trim();
      }
      // fix double slash from baseURL
      if (config.url.startsWith('/') && config.baseURL.endsWith('/')) {
        config.url = config.url.substring(1);
      }
    } catch {
      // ignore failure
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// handle responses
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // could auto-redirect on 401
    return Promise.reject(error);
  }
);

export default instance;
