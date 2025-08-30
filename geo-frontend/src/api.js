import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Add API key to all requests
    config.headers["x-api-key"] = import.meta.env.VITE_BACKEND_API_KEY;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;