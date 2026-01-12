import api from "./axios";

// API functions for categories
export const getCategories = () => api.get("/categories");

// ✅ FIXED: No more FormData. We send a simple JSON object { name, image }
export const addCategoryApi = (categoryData) => {
    // categoryData will look like: { name: "Shoes",... }
    return api.post("/categories", categoryData);
};

// ✅ FIXED: Send JSON for updates
export const updateCategoryApi = (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
};

export const deleteCategoryApi = (id) => api.delete(`/categories/${id}`);