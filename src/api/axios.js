import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// REQUEST: Attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !(config.method === "post" && config.url === "/orders")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: Catch 401 errors and redirect automatically
api.interceptors.response.use(
  (response) => response, // If the request succeeds, just return it
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Clear the expired token
      localStorage.removeItem("token");
      
      // 2. Force redirect to login page instantly
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;