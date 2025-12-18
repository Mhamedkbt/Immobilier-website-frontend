import api from "./axios";

const getToken = () => localStorage.getItem("token");

export const getProducts = () => api.get("/products");

// FIX 1: Add the missing category endpoint function 
export const fetchCategories = () => api.get("/categories"); 

export const addProduct = (productData) => {
  return api.post("/products", productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProduct = (id, formData) => {
  return api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


export const deleteProduct = (id) => api.delete(`/products/${id}`);

