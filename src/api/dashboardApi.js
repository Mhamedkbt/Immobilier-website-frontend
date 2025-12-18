// Import your CUSTOM 'api' instance, not the default axios
import api from "./api"; 

export const getDashboardStats = async () => {
  // Use 'api' so it automatically gets the token and handles 401 redirects
  const res = await api.get("/dashboard"); 
  return res.data;
};