import React, { useState, useEffect, useCallback } from "react";
import { getCategories, addCategoryApi, updateCategoryApi, deleteCategoryApi } from "../../api/categoriesApi";
import { getProducts } from "../../api/productsApi"; 
import API_URL from "../../config/api";

const normalizeImagePath = (relativePath) => {
    if (!relativePath || relativePath.startsWith("http")) return relativePath;
    let path = relativePath.replace(/\\/g, '/');
    return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: data });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const json = await res.json();
  return json.secure_url;
};

// --- Reusable Spinner Component ---
const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function Categories({ refreshKey }) { 
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // NEW: For Edit Button
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [editingImageFile, setEditingImageFile] = useState(null);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await getCategories();
            setCategories(res.data.map(c => ({ ...c, imageUrl: normalizeImagePath(c.image) })));
        } catch (err) { console.error(err); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await getProducts();
            setProducts(res.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchCategories(); fetchProducts(); }, [fetchCategories, fetchProducts, refreshKey]); 

    const getProductCount = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? products.filter(p => p.category === cat.name).length : 0;
    };

    const getPreviewUrl = (file) => (file ? URL.createObjectURL(file) : null);

    const addCategory = async () => {
        if (isAdding || !categoryInput.trim() || !newImageFile) return;
        setIsAdding(true);
        try {
            const imageUrl = await uploadToCloudinary(newImageFile);
            const res = await addCategoryApi({ name: categoryInput.trim(), image: imageUrl });
            setCategories(prev => [...prev, { ...res.data, imageUrl: normalizeImagePath(res.data.image) }]);
            setCategoryInput(""); setNewImageFile(null);
        } catch (err) { alert("Error adding category"); } finally { setIsAdding(false); }
    };

    const saveEdit = async () => {
        if (!editingValue.trim() || isSaving) return;
        setIsSaving(true); // Start Loading
        try {
            let finalImageUrl = categories.find(c => c.id === editingId).image;
            if (editingImageFile) finalImageUrl = await uploadToCloudinary(editingImageFile);
            await updateCategoryApi(editingId, { name: editingValue.trim(), image: finalImageUrl });
            await fetchCategories();
            setEditingId(null); setEditingImageFile(null);
        } catch (err) { alert("Update failed"); } finally { setIsSaving(false); } // Stop Loading
    };

    const handleDelete = async () => {
        const count = getProductCount(deleteId);
        if (count > 0) return alert(`Cannot delete. ${count} products exist.`);
        try {
            await deleteCategoryApi(deleteId);
            setCategories(prev => prev.filter(c => c.id !== deleteId));
            setDeleteId(null);
        } catch (err) { alert("Delete failed"); }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6">🏷️ Category Management</h1>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                    <i className="fas fa-plus-circle text-cyan-600"></i> Add New Category
                </h2>
                <div className="flex flex-col gap-3">
                    <input type="text" placeholder="Category Name" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}
                        className="flex-1 border-2 border-gray-200 px-4 py-3 rounded-xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 shadow-sm transition text-gray-900 bg-white" />
                    <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer" />
                    {newImageFile && <img src={getPreviewUrl(newImageFile)} className="w-20 h-20 object-cover rounded-lg border shadow-sm" />}
                    <button onClick={addCategory} disabled={isAdding || !categoryInput.trim() || !newImageFile}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-xl disabled:bg-gray-400 min-w-[140px]">
                        {isAdding ? <><Spinner /> Adding...</> : "Add Category"}
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3 flex items-center gap-2">
                    <i className="fas fa-list-alt text-cyan-600"></i> Existing Categories ({categories.length})
                </h2>
                <div className="space-y-3">
                    {categories.map((category) => (
                        <div key={category.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow-sm">
                            <div className="flex items-center gap-4 flex-1">
                                <img src={category.imageUrl || category.image} alt={category.name} className="w-16 h-16 object-cover rounded-lg" />
                                {editingId === category.id ? (
                                    <div className="flex-1">
                                        <input type="text" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} 
                                            className="border-2 border-cyan-500 px-3 py-2 rounded-lg w-full mb-2 focus:outline-none" />
                                        <input type="file" accept="image/*" onChange={(e) => setEditingImageFile(e.target.files[0])}
                                            className="text-xs text-gray-500 file:bg-indigo-50 file:text-indigo-700 file:rounded-full file:px-2 file:py-1 file:border-0 cursor-pointer" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-baseline gap-3">
                                        <span className="text-lg font-bold text-gray-700">{category.name}</span>
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800">{getProductCount(category.id)} Products</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                {editingId === category.id ? (
                                    <>
                                        <button onClick={saveEdit} disabled={!editingValue.trim() || isSaving}
                                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition flex-1 sm:flex-none disabled:bg-gray-400 min-w-[100px]">
                                            {isSaving ? <><Spinner /> Saving...</> : <><i className="fas fa-save mr-1"></i> Save</>}
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded-xl text-sm font-bold flex-1 sm:flex-none">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setEditingId(category.id); setEditingValue(category.name); }} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-bold flex-1 sm:flex-none"><i className="fas fa-pencil-alt"></i> Edit</button>
                                        <button onClick={() => setDeleteId(category.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-bold flex-1 sm:flex-none"><i className="fas fa-trash-alt"></i> Delete</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {deleteId && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm text-center">
                        <h2 className="text-2xl font-bold mb-3">Confirm Deletion</h2>
                        <p className="mb-6 text-gray-600">Are you sure? This will fail if products exist.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-xl bg-gray-200 flex-1 font-semibold">Cancel</button>
                            <button onClick={handleDelete} className="px-5 py-2 rounded-xl bg-red-600 text-white flex-1 font-semibold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}