import axios from "axios";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ✅ Only attach token if the request is NOT POST /orders
    if (token && !(config.method === "post" && config.url === "/orders")) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
