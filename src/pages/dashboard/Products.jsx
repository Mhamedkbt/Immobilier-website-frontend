

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import AddProductForm from "./AddProductForm";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../../api/productsApi";
import { getCategories } from "../../api/categoriesApi";
import API_URL from "../../config/api";

const BACKEND_URL = API_URL;
const DEFAULT_IMAGE = "/no-image.png";

const parseBoolean = (value) =>
  !(value === false || value === 0 || String(value).toLowerCase() === "false" || value == null);

const getFullImageUrl = (path) => {
  if (!path) return DEFAULT_IMAGE;
  const s = String(path);
  if (s.startsWith("http")) return s;
  const normalized = s.replace(/\\/g, "/");
  return normalized.startsWith("/")
    ? `${BACKEND_URL}${normalized}`
    : `${BACKEND_URL}/${normalized}`;
};

const nfmt = (n) => {
  if (n == null || n === "") return "—";
  const x = Number(n);
  if (Number.isNaN(x)) return "—";
  return new Intl.NumberFormat("fr-FR").format(x);
};

const firstNonEmpty = (...vals) => vals.find((v) => v != null && String(v).trim() !== "");

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
}

const ImmoCard = ({ product, onEdit, onDelete }) => {
  const title = firstNonEmpty(product.title, product.name, "Annonce");
  const category = firstNonEmpty(product.category, product.type, "Bien");
  const city = firstNonEmpty(product.city, product.address, product.location, "");
  const price = firstNonEmpty(product.price, product.currentPrice);
  const surface = firstNonEmpty(product.surfaceM2, product.surface, product.area, product.size);

  const mainImage =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image?.url ||
    product.image ||
    DEFAULT_IMAGE;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={getFullImageUrl(mainImage)}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
          loading="lazy"
          decoding="async"
        />

        <div className="absolute top-3 left-3 flex gap-2">
          <Badge tone="indigo">{category}</Badge>
        </div>

        <div className="absolute bottom-3 right-3">
          {product.isAvailable ? <Badge tone="green">Disponible</Badge> : <Badge tone="red">Indisponible</Badge>}
        </div>

        {/* subtle overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />
      </div>

      {/* Body */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{title}</h3>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-emerald-700 leading-none">
              {price != null ? `${nfmt(price)} DH` : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">{surface != null ? `${nfmt(surface)} m²` : "—"}</div>
          </div>
        </div>

        {city && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-1">
            📍 <span className="font-semibold">{city}</span>
          </p>
        )}

        {product.description && (
          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">{product.description}</p>
        )}

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => onEdit(product)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2.5 transition shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v14m-7-7h14" />
            </svg>
            Modifier
          </button>

          <button
            onClick={() => onDelete(product.id)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2.5 transition shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m2 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const gridSectionRef = useRef(null);

  const [modalState, setModalState] = useState({
    showForm: false,
    editProduct: null,
    deleteProductId: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const { showForm, editProduct, deleteProductId } = modalState;

  const processProductData = useCallback((p) => {
    const normalizeImageObject = (img) => {
      const path = img?.path || img;
      if (!path) return null;
      return { url: getFullImageUrl(path), blurHash: img?.blurHash || null };
    };

    return {
      ...p,
      images: (p.images || []).map(normalizeImageObject).filter(Boolean),
      isAvailable: parseBoolean(p.isAvailable),
      onPromotion: parseBoolean(p.onPromotion),
    };
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getProducts();
      setProducts((res?.data || []).map(processProductData));
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  }, [processProductData]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      setCategories(res?.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSearchAction = () => {
    if (window.innerWidth < 1024) {
      gridSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenAddForm = () => setModalState({ showForm: true, editProduct: null, deleteProductId: null });
  const handleOpenEditForm = (product) => setModalState({ showForm: true, editProduct: product, deleteProductId: null });
  const handleCloseForm = () => setModalState((prev) => ({ ...prev, showForm: false }));

  const handleOpenDeleteModal = (id) => setModalState((prev) => ({ ...prev, deleteProductId: id }));
  const handleCloseDeleteModal = () => setModalState((prev) => ({ ...prev, deleteProductId: null }));

  const handleAddOrEdit = async (productData) => {
    try {
      const res = editProduct
        ? await updateProduct(editProduct.id, productData)
        : await addProduct(productData);

      const processed = processProductData(res.data);

      setProducts((prev) =>
        editProduct
          ? prev.map((p) => (p.id === processed.id ? processed : p))
          : [processed, ...prev]
      );

      handleCloseForm();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(deleteProductId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProductId));
      handleCloseDeleteModal();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const title = String(p.title || p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      const addr = String(p.address || p.city || p.location || "").toLowerCase();

      const matchesSearch = !q || title.includes(q) || desc.includes(q) || addr.includes(q);
      const matchesCategory = filterCategory ? String(p.category || p.type || "") === filterCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-5 mb-8 bg-white p-5 md:p-7 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Gestion des annonces</h1>
          <p className="text-sm text-gray-500 mt-1">Créez, modifiez et supprimez vos annonces immobilières.</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:flex-1 md:w-72">
            <input
              type="search"
              placeholder="Recherche (titre, ville, description)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchAction()}
              className="w-full h-[46px] border border-gray-200 px-4 pr-10 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition text-gray-900 placeholder-gray-500 bg-white"
            />
            <button
              type="button"
              onClick={handleSearchAction}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-[46px] border border-gray-200 px-4 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 w-full sm:w-56 bg-white font-semibold text-gray-700"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Add */}
          <button
            onClick={handleOpenAddForm}
            className="h-[46px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-sm transition active:scale-95 w-full sm:w-auto flex items-center justify-center whitespace-nowrap"
          >
            + Ajouter une annonce
          </button>
        </div>
      </div>

      {/* GRID */}
      <div ref={gridSectionRef} className="bg-white p-4 md:p-7 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Annonces <span className="ml-2 text-sm font-semibold text-gray-400">({filteredProducts.length})</span>
          </h2>

          <button
            type="button"
            onClick={fetchProducts}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2.5 transition w-full sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-14.5-3.5M4 16a8 8 0 0014.5 3.5" />
            </svg>
            Actualiser
          </button>
        </div>

        {/* ✅ Mobile: 1 / Desktop: 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ImmoCard
              key={product.id}
              product={product}
              onEdit={handleOpenEditForm}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="h-12 w-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-semibold">Aucune annonce trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Essayez de modifier la recherche ou le filtre.</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-7 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-gray-100">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10 3h4l1 2h4v2H5V5h4l1-2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Supprimer l’annonce ?</h2>
            <p className="text-gray-500 mb-6">Cette action est définitive.</p>

            <div className="flex gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <AddProductForm
          categories={categories}
          product={editProduct}
          onAdd={handleAddOrEdit}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
