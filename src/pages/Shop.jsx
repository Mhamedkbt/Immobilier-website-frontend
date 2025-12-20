import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/productsApi.js';
import { getCategories } from '../api/categoriesApi.js';
import ProductCard from "../components/ProductCard.jsx";
import Navbar from '../components/Navbar.jsx'; 
import Footer from '../components/Footer.jsx';
import API_URL from "../config/api";

// --- Configuration ---
const BACKEND_URL = API_URL;

const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    let normalizedPath = path.replace(/\\/g, '/');
    return normalizedPath.startsWith('/') ? `${BACKEND_URL}${normalizedPath}` : `${BACKEND_URL}/${normalizedPath}`;
};

const parseBoolean = (value) => {
    return !(value === false || value === 0 || String(value).toLowerCase() === "false" || value === null || value === undefined);
};

export default function ProductListing() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const initialCategoryId = searchParams.get("categoryId");
    
    // --- State ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortMethod, setSortMethod] = useState('best_match'); 
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

    // --- Data Processing ---
    const processProductData = useCallback((product) => {
        const normalizeImage = (imgObj) => {
            const path = imgObj?.path || imgObj; 
            if (!path) return null;
            return { url: getFullImageUrl(path), blurHash: imgObj?.blurHash || null };
        };
        return {
            ...product,
            images: (product.images || []).map(normalizeImage).filter(img => img?.url),
            isAvailable: parseBoolean(product.isAvailable),
            onPromotion: parseBoolean(product.onPromotion),
        };
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [productRes, categoryRes] = await Promise.all([getProducts(), getCategories()]);
                setProducts(productRes.data.map(processProductData));
                setCategories(categoryRes.data);
            } catch (err) {
                setError(`Connection Error: Check server at ${BACKEND_URL}`);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [processProductData]);

    // --- URL Category Handling ---
    useEffect(() => {
        if (initialCategoryId && categories.length > 0) {
            const match = categories.find(cat => String(cat.id) === initialCategoryId);
            setSelectedCategory(match ? match.name : 'All');
        }
    }, [initialCategoryId, categories]);

    // --- Core Search/Filter/Sort Engine ---
    const filteredAndSortedProducts = useMemo(() => {
        let items = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesAvailability = !showOnlyAvailable || p.isAvailable;
            return matchesSearch && matchesCategory && matchesAvailability;
        });

        switch (sortMethod) {
            case 'price_asc': items.sort((a, b) => a.price - b.price); break;
            case 'price_desc': items.sort((a, b) => b.price - a.price); break;
            case 'name_asc': items.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'newest': items.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
            default: break;
        }
        return items;
    }, [products, searchTerm, selectedCategory, sortMethod, showOnlyAvailable]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-700 mb-4 mx-auto"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8 text-center">
            <div className="bg-white p-10 rounded-xl shadow-2xl border border-red-200">
                <h1 className="text-3xl font-semibold text-red-700 mb-4">Data Error</h1>
                <p className="text-gray-700 font-medium">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 md:px-8 py-10">
                <header className="text-center mb-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">All Products</h1>
                    <input
                        type="search"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full max-w-2xl border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition text-gray-900 bg-white"
                    />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:h-fit lg:sticky lg:top-4">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">Refine</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-medium mb-2">Category</h3>
                                <select 
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-indigo-500"
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <h3 className="text-base font-medium">Available Only</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={showOnlyAvailable} onChange={e => setShowOnlyAvailable(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                        </div>
                    </aside>

                    <section className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <p className="text-gray-600">Results: <span className="text-indigo-600 font-bold">{filteredAndSortedProducts.length}</span></p>
                            <select 
                                value={sortMethod}
                                onChange={e => setSortMethod(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500"
                            >
                                <option value="best_match">Best Match</option>
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Name: A to Z</option>
                            </select>
                        </div>

                        {filteredAndSortedProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-800">No matching products found</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} isPublic={true} /> 
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}