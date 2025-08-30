import axios from "axios";

// Create a direct axios instance for components that can't use hooks
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add API key to all requests
api.interceptors.request.use(
  (config) => {
    config.headers["x-api-key"] = import.meta.env.VITE_BACKEND_API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a custom hook for components that can use hooks
export const useApi = () => {
  const apiWithAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  });

  // Add request interceptor to include auth token
  apiWithAuth.interceptors.request.use(
    async (config) => {
      // Add API key to all requests
      config.headers["x-api-key"] = import.meta.env.VITE_BACKEND_API_KEY;
      
      // Try to add auth token if available
      try {
        const { getAccessTokenSilently } = await import("@auth0/auth0-react");
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.log("No auth token available");
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiWithAuth;
};

export default api;