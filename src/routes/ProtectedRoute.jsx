// Add this to your axios api instance response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Force total redirect
    }
    return Promise.reject(error);
  }
);