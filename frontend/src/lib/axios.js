import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    try {
      const authStore = localStorage.getItem('auth-store');
      console.log('Auth store from localStorage:', authStore);
      
      let token = null;
      
      if (authStore) {
        const parsedStore = JSON.parse(authStore);
        console.log('Parsed auth store:', parsedStore);
        
        // Check for token in different possible locations
        token = parsedStore.state?.token || parsedStore.token || null;
      }
      
      console.log('Using token for request:', token ? 'Token exists' : 'No token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Check if we have auth headers
      console.log('Request headers:', config.headers);
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
