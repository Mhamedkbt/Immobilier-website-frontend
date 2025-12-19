import React, { useState, useEffect, useCallback } from "react";
import { 
    getCategories, 
    addCategoryApi, 
    updateCategoryApi, 
    deleteCategoryApi 
} from "../../api/categoriesApi";
import { getProducts } from "../../api/productsApi"; 
import API_URL from "../../config/api";

// 🎯 Utility function to create the full image URL
const normalizeImagePath = (relativePath) => {
    if (!relativePath) return null;
    // Assuming your backend is running on the same host/port 
    // and exposes images via the /uploads prefix (as configured in WebConfig)
    
    // FIX: Check if the path is already a full URL or relative, and prepend if necessary
    if (relativePath.startsWith("http")) return relativePath;
    
    // Normalize path separators and ensure leading slash
    let path = relativePath.replace(/\\/g, '/');
    if (!path.startsWith('/')) {
        path = `/${path}`;
    }
    
    return `${API_URL}${path}`;
};

export default function Categories({ refreshKey }) { 
    const [isAdding, setIsAdding] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    
    // 🎯 NEW STATE FOR IMAGE UPLOADS
    const [newImageFile, setNewImageFile] = useState(null);
    const [editingImageFile, setEditingImageFile] = useState(null);

    // ----------------------------------------------------
    // FETCHING LOGIC (MODIFIED to handle image URL)
    // ----------------------------------------------------

    const fetchCategories = useCallback(async () => {
        try {
            const res = await getCategories();
            // 🎯 MAP the category data to include the full imageUrl for display
            const processedCategories = res.data.map(c => ({
                ...c,
                imageUrl: normalizeImagePath(c.image) 
            }));
            setCategories(processedCategories);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products for counting:", err);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts, refreshKey]); 

    // ----------------------------------------------------
    // UTILITY FUNCTION
    // ----------------------------------------------------

    const getProductCount = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return 0;

        // Ensure product.category matches category.name
        return products.filter(p => p.category === category.name).length;
    };

    // Function to generate a local image URL for preview
    const getPreviewUrl = (file) => (file ? URL.createObjectURL(file) : null);


    // ----------------------------------------------------
    // CRUD Operations (MODIFIED for file upload)
    // ----------------------------------------------------
    
    // Add category
    // ... (keep your existing uploadToCloudinary function here)

// Add category
const addCategory = async () => {
    if (isAdding) return;
    if (!categoryInput.trim() || !newImageFile) {
        alert("Please provide a name and an image.");
        return;
    }

    setIsAdding(true);
    try {
        // 1. Upload to Cloudinary first
        const imageUrl = await uploadToCloudinary(newImageFile);

        // 2. Send JSON to Spring Boot
        const payload = {
            name: categoryInput.trim(),
            image: imageUrl // Just the URL string
        };

        const res = await addCategoryApi(payload);

        setCategories(prev => [...prev, res.data]);
        setCategoryInput("");
        setNewImageFile(null);

    } catch (err) {
        console.error("Failed to add category:", err);
        alert("Error uploading category image.");
    } finally {
        setIsAdding(false);
    }
};

// Save edited category
const saveEdit = async () => {
    if (!editingValue.trim()) return;

    try {
        let finalImageUrl = categories.find(c => c.id === editingId).image;

        // If user selected a NEW file, upload it. Otherwise, keep the old URL.
        if (editingImageFile) {
            finalImageUrl = await uploadToCloudinary(editingImageFile);
        }

        const payload = {
            name: editingValue.trim(),
            image: finalImageUrl
        };

        await updateCategoryApi(editingId, payload);
        
        // Refresh local state
        await fetchCategories();
        setEditingId(null);
        setEditingImageFile(null);
        
    } catch (err) {
        console.error("Failed to update:", err);
        alert("Update failed.");
    }
};

    // Delete category (unchanged logic)
    const handleDelete = async () => {
        try {
            // 🚨 SECURITY/CHECK: Prevent deleting a category that still has products
            const productCount = getProductCount(deleteId);
            if (productCount > 0) {
                 alert(`Cannot delete category. There are ${productCount} products associated with it. Please re-assign or delete them first.`);
                 setDeleteId(null);
                 return;
            }
            
            await deleteCategoryApi(deleteId);
            setCategories(categories.filter((c) => c.id !== deleteId));
            setDeleteId(null);
            fetchProducts();
        } catch (err) {
            console.error("Failed to delete category:", err.response?.data || err.message);
            alert("Failed to delete category. Check console for details.");
        }
    };

    // Start editing (MODIFIED to clear editingImageFile)
    const startEdit = (category) => {
        setEditingId(category.id);
        setEditingValue(category.name);
        setEditingImageFile(null); // Clear previous file state when starting a new edit
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6">🏷️ Category Management</h1>

            {/* Add New Category Section (WITH FILE INPUT) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                    <i className="fas fa-plus-circle text-cyan-600"></i> Add New Category
                </h2>
                <div className="flex flex-col gap-3">
                    {/* Category Name Input */}
<input
    type="text"
    placeholder="Category Name (e.g., Electronics)"
    value={categoryInput}
    onChange={(e) => setCategoryInput(e.target.value)}
    // Added text-gray-900, placeholder-gray-500, and bg-white
    className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 shadow-sm transition text-gray-900 placeholder-gray-500 bg-white"
/>

                    {/* Image File Input */}
                    <label className="block text-sm font-medium text-gray-700">Category Image (Required)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewImageFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-cyan-50 file:text-cyan-700
                            hover:file:bg-cyan-100 cursor-pointer"
                    />

                    {/* Image Preview for New Category */}
                    {newImageFile && (
                        <div className="mt-3">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2">Image Preview:</h3>
                            <img 
                                src={getPreviewUrl(newImageFile)}
                                alt="New Category Preview" 
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                            />
                        </div>
                    )}
                    
                    <button
    onClick={addCategory}
    disabled={isAdding || !categoryInput.trim() || !newImageFile}
    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-xl
               disabled:bg-gray-400 disabled:cursor-not-allowed"
>
    {isAdding ? "Adding..." : "Add Category"}
</button>

                </div>
            </div>

            {/* Existing Categories List Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                    <i className="fas fa-list-alt text-cyan-600"></i> Existing Categories ({categories.length})
                </h2>
                <div className="space-y-3 pr-2">
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow-sm"
                            >
                                <div className="flex items-center gap-4 flex-1 flex-wrap">
                                    {/* Category Image Display */}
                                    <img 
                                     src={category.image} // Cloudinary returns the full URL, use it directly
                                     alt={category.name} 
                                     className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    
                                    {editingId === category.id ? (
                                        <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                                            <input
                                                type="text"
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                                                className="flex-1 border-2 border-cyan-500 px-3 py-2 rounded-lg text-lg font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-200 w-full mb-2"
                                            />
                                            {/* Edit Image File Input */}
                                            <label className="block text-sm font-medium text-gray-700">Change Image (Optional)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setEditingImageFile(e.target.files[0])}
                                                className="block w-full text-xs text-gray-500
                                                    file:mr-2 file:py-1 file:px-2
                                                    file:rounded-full file:border-0
                                                    file:text-xs file:font-semibold
                                                    file:bg-indigo-50 file:text-indigo-700
                                                    hover:file:bg-indigo-100 cursor-pointer"
                                            />
                                            {/* Edit Image Preview */}
                                            {(editingImageFile || category.imageUrl) && (
                                                <div className="mt-2">
                                                    <h3 className="text-xs font-semibold text-gray-800 mb-1">Current/New Preview:</h3>
                                                    <img 
                                                        src={getPreviewUrl(editingImageFile) || category.imageUrl}
                                                        alt="Edit Preview" 
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-300 shadow-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col sm:flex-row items-baseline gap-3">
                                                <span className="text-lg font-bold text-gray-700">
                                                    {category.name}
                                                </span>
                                                {/* DISPLAY PRODUCT COUNT HERE */}
                                                <span className="ml-0 sm:ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800 shadow-sm">
                                                    {getProductCount(category.id)} Products
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                    {editingId === category.id ? (
                                        <>
                                            <button
                                                onClick={saveEdit}
                                                disabled={!editingValue.trim()}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-bold transition flex-1 sm:flex-none disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <i className="fas fa-save mr-1"></i> Save
                                            </button>
                                            <button
                                                onClick={() => { setEditingId(null); setEditingValue(""); setEditingImageFile(null); }}
                                                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-xl text-sm font-bold transition flex-1 sm:flex-none"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startEdit(category)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-bold transition flex-1 sm:flex-none"
                                            >
                                                <i className="fas fa-pencil-alt"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(category.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-bold transition flex-1 sm:flex-none"
                                            >
                                                <i className="fas fa-trash-alt"></i> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-5">No categories have been added yet.</p>
                    )}
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs md:max-w-sm text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Confirm Deletion</h2>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete the category {categories.find(c => c.id === deleteId)?.name}?
                            There are {getProductCount(deleteId)} products associated with it. 
                            Deletion will fail if products still exist.
                        </p>
                        <div className="flex justify-between mt-4 gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1 font-semibold transition">Cancel</button>
                            <button 
                                onClick={handleDelete} 
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex-1 font-semibold transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
