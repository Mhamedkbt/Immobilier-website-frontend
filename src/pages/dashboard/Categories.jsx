// Categories.jsx (IMMO VERSION - IMAGEKIT + STYLE FIX + BUG FIXES)
// ✅ Switched Cloudinary -> ImageKit upload (no backend change needed; still saves image URL string)
// ✅ Fix: wrong <img src={category.image}> (now uses category.imageUrl always)
// ✅ Fix: editing uses correct existing URL even after normalize
// ✅ Better style + small titles above inputs (like “Transaction” style)
// ✅ Proper preview URL cleanup to avoid memory leak
// ✅ Keeps your logic (products count, delete protection, edit flow)

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  getCategories,
  addCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../api/categoriesApi";
import { getProducts } from "../../api/productsApi";
import API_URL from "../../config/api";

// ------------------------- UI helpers (style)
const labelClasses = "text-[11px] font-bold tracking-wide text-gray-600 mb-1.5 uppercase";
const inputClasses =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 placeholder-gray-400 shadow-sm " +
  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition";
const fileInputClasses =
  "w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3.5 " +
  "text-indigo-800 font-bold cursor-pointer hover:bg-indigo-100 transition";

// ------------------------- Image URL normalize (keeps API_URL support)
const normalizeImagePath = (value) => {
  if (!value) return null;

  const s = String(value);

  // already hosted
  if (s.startsWith("http")) return s;

  // local backend stored path
  let path = s.replace(/\\/g, "/");
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_URL}${path}`;
};

// ------------------------- ImageKit upload
// Put these in .env (Vite):
// VITE_IMAGEKIT_PUBLIC_KEY=...
// VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxxx
// VITE_IMAGEKIT_AUTH_ENDPOINT=http://localhost:8080/api/imagekit/auth  (recommended)
// OR if you already have a ready upload endpoint, set it here.
//
// ⚠️ For ImageKit you typically need a backend auth endpoint.
// If you DON'T have it yet, make one in Spring that returns ImageKit auth params.
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const IMAGEKIT_AUTH_ENDPOINT = import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT;

// Upload file to ImageKit using backend auth endpoint
const uploadToImageKit = async (file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "/immobilier/categories");
  
    const token = localStorage.getItem("token");
  
    const res = await fetch(`${API_URL}/api/uploads/image`, {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  
    const text = await res.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {}
  
    if (!res.ok) throw new Error(json?.message || text || "Upload failed");
    if (!json?.url) throw new Error("Upload ok but no url returned");
  
    return json.url;
  };
  

// --- PRO SPINNER COMPONENT ---
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white inline mr-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function Categories({ refreshKey }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [categoryInput, setCategoryInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const [newImageFile, setNewImageFile] = useState(null);
  const [editingImageFile, setEditingImageFile] = useState(null);

  // previews cleanup
  const previewsRef = useRef([]);
  const makePreviewUrl = (file) => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    previewsRef.current.push(url);
    return url;
  };
  useEffect(() => {
    return () => {
      for (const url of previewsRef.current) URL.revokeObjectURL(url);
    };
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      const processed = (res.data || []).map((c) => ({
        ...c,
        imageUrl: normalizeImagePath(c.image),
      }));
      setCategories(processed);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch products for counting:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts, refreshKey]);

  const getProductCount = useCallback(
    (categoryId) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return 0;
      return products.filter((p) => p.category === category.name).length;
    },
    [categories, products]
  );

  const currentEditCategory = useMemo(
    () => categories.find((c) => c.id === editingId) || null,
    [categories, editingId]
  );

  const addCategory = async () => {
    if (isAdding) return;

    if (!categoryInput.trim() || !newImageFile) {
      alert("Please provide a name and an image.");
      return;
    }

    setIsAdding(true);
    try {
      const imageUrl = await uploadToImageKit(newImageFile);

      const payload = {
        name: categoryInput.trim(),
        image: imageUrl, // saved as URL string
      };

      const res = await addCategoryApi(payload);

      // make sure it has imageUrl for UI
      const added = {
        ...res.data,
        imageUrl: normalizeImagePath(res.data?.image),
      };

      setCategories((prev) => [...prev, added]);
      setCategoryInput("");
      setNewImageFile(null);

      // refresh counts
      fetchProducts();
    } catch (err) {
      console.error("Failed to add category:", err);
      alert(err.message || "Error uploading category image.");
    } finally {
      setIsAdding(false);
    }
  };

  const saveEdit = async () => {
    if (!editingValue.trim() || isSaving || !editingId) return;

    setIsSaving(true);
    try {
      // keep existing image url if no new file
      let finalImageUrl = currentEditCategory?.imageUrl || normalizeImagePath(currentEditCategory?.image);

      if (editingImageFile) {
        finalImageUrl = await uploadToImageKit(editingImageFile);
      }

      const payload = {
        name: editingValue.trim(),
        image: finalImageUrl, // keep URL string
      };

      await updateCategoryApi(editingId, payload);
      await fetchCategories();

      setEditingId(null);
      setEditingValue("");
      setEditingImageFile(null);

      fetchProducts();
    } catch (err) {
      console.error("Failed to update:", err);
      alert(err.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const productCount = getProductCount(deleteId);
      if (productCount > 0) {
        alert(
          `Cannot delete category. There are ${productCount} products associated with it. Please re-assign or delete them first.`
        );
        setDeleteId(null);
        return;
      }

      await deleteCategoryApi(deleteId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete category:", err.response?.data || err.message);
      alert("Failed to delete category. Check console for details.");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditingValue(category.name);
    setEditingImageFile(null);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🏷️ Category Management</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit, and delete property categories.</p>
        </div>
      </div>

      {/* Add */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <i className="fas fa-plus" />
            </span>
            Add New Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className={labelClasses}>Category name</div>
            <input
              type="text"
              placeholder="Ex: Apartment, Villa, Office..."
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <div className={labelClasses}>Category image</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
              className={fileInputClasses}
            />
          </div>

          {newImageFile && (
            <div className="md:col-span-3">
              <div className={labelClasses}>Preview</div>
              <div className="flex items-center gap-3">
                <img
                  src={makePreviewUrl(newImageFile)}
                  alt="New Category Preview"
                  className="w-16 h-16 object-cover rounded-2xl border border-gray-200 shadow-sm"
                />
                <div className="text-sm text-gray-600">
                  <div className="font-bold text-gray-900">{categoryInput || "New Category"}</div>
                  <div className="text-xs text-gray-500">Image will be uploaded to ImageKit.</div>
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-3">
            <button
              onClick={addCategory}
              disabled={isAdding || !categoryInput.trim() || !newImageFile}
              className={`w-full rounded-2xl px-4 py-3.5 font-bold shadow-xl transition active:scale-[0.99] ${
                isAdding || !categoryInput.trim() || !newImageFile
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isAdding ? (
                <>
                  <Spinner /> Adding...
                </>
              ) : (
                "Add Category"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <i className="fas fa-layer-group" />
            </span>
            Existing Categories
          </h2>
          <div className="text-sm font-bold text-gray-500">{categories.length}</div>
        </div>

        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((category) => {
              const isEditing = editingId === category.id;
              const count = getProductCount(category.id);

              return (
                <div
                  key={category.id}
                  className="rounded-3xl border border-gray-100 bg-gray-50/40 p-4 md:p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={category.imageUrl || DEFAULT_IMAGE}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded-2xl border border-gray-200 bg-white"
                        onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                      />

                      {!isEditing ? (
                        <div>
                          <div className="text-lg font-bold font-black text-gray-900">{category.name}</div>
                          <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold">
                            {count} Products
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className={labelClasses}>Category name</div>
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            className={inputClasses}
                          />

                          <div className="mt-3">
                            <div className={labelClasses}>Change image (optional)</div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditingImageFile(e.target.files?.[0] || null)}
                              className={fileInputClasses}
                            />
                          </div>

                          {(editingImageFile || category.imageUrl) && (
                            <div className="mt-3 flex items-center gap-3">
                              <img
                                src={makePreviewUrl(editingImageFile) || category.imageUrl || DEFAULT_IMAGE}
                                alt="Edit Preview"
                                className="w-14 h-14 object-cover rounded-2xl border border-gray-200 bg-white"
                                onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                              />
                              <div className="text-xs text-gray-600">
                                Preview (new image will replace current).
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            disabled={!editingValue.trim() || isSaving}
                            className={`flex-1 md:flex-none rounded-2xl px-4 py-3 font-bold transition ${
                              !editingValue.trim() || isSaving
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {isSaving ? (
                              <>
                                <Spinner /> Saving...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save mr-2" />
                                Save
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingValue("");
                              setEditingImageFile(null);
                            }}
                            className="flex-1 md:flex-none rounded-2xl px-4 py-3 font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(category)}
                            className="flex-1 md:flex-none rounded-2xl px-4 py-3 font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition"
                          >
                            <i className="fas fa-pen mr-2" />
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteId(category.id)}
                            className="flex-1 md:flex-none rounded-2xl px-4 py-3 font-bold bg-red-600 hover:bg-red-700 text-white transition"
                          >
                            <i className="fas fa-trash mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-10 font-semibold">No categories have been added yet.</p>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center border border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Confirm Deletion</h2>
            <p className="mb-6 text-gray-600 text-sm leading-relaxed">
              Delete category{" "}
              <span className="font-bold text-gray-900">
                {categories.find((c) => c.id === deleteId)?.name}
              </span>
              ?<br />
              There are <span className="font-bold">{getProductCount(deleteId)}</span> products associated with it.
              Deletion will fail if products still exist.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-2xl px-4 py-3 font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl px-4 py-3 font-bold bg-red-600 hover:bg-red-700 text-white transition"
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
