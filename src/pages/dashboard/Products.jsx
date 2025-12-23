import React, { useState, useEffect, useCallback, useRef } from "react";
import AddProductForm from "./AddProductForm"; 
import { getProducts, addProduct, updateProduct, deleteProduct } from "../../api/productsApi";
import { getCategories } from "../../api/categoriesApi";
import API_URL from "../../config/api"; 

const parseBoolean = (value) => {
    if (value === false || value === 0 || String(value).toLowerCase() === "false" || value === null || value === undefined) {
        return false;
    }
    return true;
};

const ProductCard = ({ product, onEdit, onDelete }) => {
    const defaultImage = "/no-image.png"; 
    const imageUrl = product.images?.[0] || defaultImage;
    
    const AvailabilityBadge = product.isAvailable 
        ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 shadow-sm">Available</span>
        : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 shadow-sm">Unavailable</span>;

    const PromotionPill = product.onPromotion 
        ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 shadow-sm">Promotion</span>
        : null;

    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-4 flex flex-col h-full overflow-hidden border border-gray-100">
            <div className="relative mb-3">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg border border-gray-100"
                    onError={e => { 
                        if (e.target.src !== defaultImage) {
                            e.target.src = defaultImage; 
                        }
                    }}
                />
                <div className="absolute top-2 left-2">{PromotionPill}</div>
                <div className="absolute bottom-2 right-2">{AvailabilityBadge}</div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
                <h2 className="font-extrabold text-lg text-gray-900 truncate" title={product.name}>
                    {product.name}
                </h2>
                <p className="text-indigo-600 text-sm font-medium">{product.category}</p>
                <p className="text-gray-500 text-xs overflow-hidden h-8 line-clamp-2 mt-1">{product.description}</p>
                
                <div className="flex items-baseline gap-2 mt-2 pt-1">
                    {product.onPromotion && (
                        <span className="text-gray-400 line-through font-medium text-sm">
                            {product.previousPrice} DH
                        </span>
                    )}
                    <span className="text-xl font-extrabold text-green-600">
                        {product.price} DH
                    </span>
                </div>
            </div>

            <div className="flex justify-between mt-4 gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => onEdit(product)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl shadow-md transition flex-1 text-sm flex items-center justify-center font-semibold">
                    <i className="fas fa-edit mr-1"></i> Edit
                </button>
                <button onClick={() => onDelete(product.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl shadow-md transition flex-1 text-sm flex items-center justify-center font-semibold">
                    <i className="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        </div>
    );
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const gridSectionRef = useRef(null);
    const [modalState, setModalState] = useState({ showForm: false, editProduct: null, deleteProductId: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const { showForm, editProduct, deleteProductId } = modalState;

    const processProductData = useCallback((product) => {
        return {
            ...product,
            images: (product.images || []).map(img => 
                img.startsWith("http") ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`
            ),
            isAvailable: parseBoolean(product.isAvailable), 
            onPromotion: parseBoolean(product.onPromotion), 
        };
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await getProducts();
            setProducts(res.data.map(processProductData));
        } catch (err) { console.error(err); }
    }, [processProductData]);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts]);

    const handleSearchAction = () => {
        if (window.innerWidth < 1024) {
            gridSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleOpenAddForm = () => setModalState({ showForm: true, editProduct: null, deleteProductId: null });
    const handleOpenEditForm = (product) => setModalState({ showForm: true, editProduct: product, deleteProductId: null });
    const handleCloseForm = () => setModalState(prev => ({ ...prev, showForm: false }));
    const handleOpenDeleteModal = (id) => setModalState(prev => ({ ...prev, deleteProductId: id }));
    const handleCloseDeleteModal = () => setModalState(prev => ({ ...prev, deleteProductId: null }));

    const handleAddOrEdit = async (productData) => {
        try {
            let res = editProduct ? await updateProduct(editProduct.id, productData) : await addProduct(productData);
            const processed = processProductData(res.data);
            setProducts(prev => editProduct ? prev.map(p => p.id === processed.id ? processed : p) : [processed, ...prev]);
            handleCloseForm();
        } catch (err) { alert(`Error: ${err.response?.data?.message || err.message}`); }
    };

    const handleDeleteProduct = async () => {
        try {
            await deleteProduct(deleteProductId);
            setProducts(products.filter(p => p.id !== deleteProductId));
            handleCloseDeleteModal();
        } catch (err) { alert("Failed to delete."); }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory ? p.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* --- IMPROVED RESPONSIVE HEADER --- */}
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 mb-8 bg-white p-5 md:p-7 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center">
                    <h1 className="text-2xl md:text-2xl font-black text-gray-900 flex items-center gap-3">
                        📦 Product Management
                    </h1>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap gap-4 items-center">
                    {/* Search Bar Container */}
                    <div className="relative w-full sm:flex-1 md:w-64">
                        <input
                            type="search"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchAction()}
                            className="w-full h-[46px] border-2 border-gray-100 px-4 pr-10 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition text-gray-900 placeholder-gray-500 bg-white"
                        />
                        <div onClick={handleSearchAction} className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-indigo-600">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    
                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="h-[46px] border-2 border-gray-100 px-4 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 w-full sm:w-48 bg-gray-50/50 font-medium text-gray-700"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    
                    {/* Add Button */}
                    <button
                        onClick={handleOpenAddForm}
                        className="h-[46px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-indigo-200 transition active:scale-95 w-full sm:w-auto flex items-center justify-center whitespace-nowrap"
                    >
                        <i className="fas fa-plus mr-2"></i> Add Product
                    </button>
                </div>
            </div>
    
            {/* Grid Section */}
            <div ref={gridSectionRef} className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Existing Catalog <span className="ml-2 text-sm font-normal text-gray-400">({filteredProducts.length} items)</span>
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onEdit={handleOpenEditForm} onDelete={handleOpenDeleteModal} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <i className="fas fa-search fa-3x mb-4 opacity-20"></i>
                        <p className="text-lg font-medium">No products found</p>
                    </div>
                )}
            </div>
            
            {/* Delete Modal */}
            {deleteProductId && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center transform animate-scale-up">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Are you sure?</h2>
                        <p className="text-gray-500 mb-8">This action cannot be undone. The product will be permanently removed.</p>
                        <div className="flex gap-3">
                            <button onClick={handleCloseDeleteModal} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition">Cancel</button>
                            <button onClick={handleDeleteProduct} className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-lg shadow-red-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}
    
            {showForm && (
                <AddProductForm categories={categories} product={editProduct} onAdd={handleAddOrEdit} onClose={handleCloseForm} />
            )}
        </div>
    );
}