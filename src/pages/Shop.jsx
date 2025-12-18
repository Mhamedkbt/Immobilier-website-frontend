import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom'; // <<< Import useSearchParams here
import { getProducts } from '../api/productsApi.js';
import { getCategories } from '../api/categoriesApi.js';
import ProductCard from "../components/ProductCard.jsx";
import Navbar from '../components/Navbar.jsx'; 
import Footer from '../components/Footer.jsx';
import API_URL from "../config/api";

// =========================================================================
// 🎯 CRITICAL CONFIGURATION & UTILITIES
// =========================================================================

// Base URL MUST match your backend server
const BACKEND_URL = API_URL;


/** Utility function to convert a relative path (string) to a full URL (string). */
const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    let normalizedPath = path.replace(/\\/g, '/');

    if (normalizedPath.startsWith('/')) {
        return `${BACKEND_URL}${normalizedPath}`;
    }
    return `${BACKEND_URL}/${normalizedPath}`;
};

// Utility function to convert API values to strict boolean
const parseBoolean = (value) => {
    if (value === false || value === 0 || String(value).toLowerCase() === "false" || value === null || value === undefined) {
        return false;
    }
    return true;
};

/**
 * Data processing function for products. 
 * Maps API data structure (path/blurHash) to the structure expected by ProductCard's image component.
 */
const processProductData = (product) => {
    
    const normalizeImageObject = (imageObject) => {
        const imagePath = imageObject?.path || imageObject; 
        
        if (!imagePath) return null;
        
        return {
            url: getFullImageUrl(imagePath),
            blurHash: imageObject?.blurHash || null, 
        };
    };

    return {
        ...product,
        images: (product.images || [])
            .map(normalizeImageObject) 
            .filter(img => img && img.url),
        isAvailable: parseBoolean(product.isAvailable),
        onPromotion: parseBoolean(product.onPromotion),
    };
};

// =========================================================================
// 🌟 MAIN PRODUCT LISTING COMPONENT
// =========================================================================

export default function ProductListing() {
    const location = useLocation();

    // Read the categoryId from the URL (e.g., /shop?categoryId=5)
    const [searchParams] = useSearchParams();
    const initialCategoryId = searchParams.get("categoryId");
    
    // --- State for Data and Loading ---
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Filters and Sorts ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortMethod, setSortMethod] = useState('best_match'); 
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
                async function loadData() {
                    setLoading(true);
                    setError(null);
                    try {
                        const [productResponse, categoryResponse] = await Promise.all([
                            getProducts(), 
                            getCategories()
                        ]);
        
                        // Process all products from the API
                        const processedProducts = productResponse.data.map(processProductData);
                        setProducts(processedProducts);
        
                        // ✅ FIX: ONLY set the categories state with the full objects. 
                        setCategories(categoryResponse.data);

            } catch (err) {
                console.error("Failed to fetch shop data:", err);
                setError(`Connection Error: Could not fetch data. Check if your server is running at ${BACKEND_URL}`);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // --- URL Parameter Initialization ---
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const urlCategory = query.get('category');
        
        // ✅ NEW LOGIC: Use category ID to find and set the category Name
        if (initialCategoryId && categories.length > 0) {
            // Find the category object that matches the ID from the URL
            const categoryMatch = categories.find(cat => String(cat.id) === initialCategoryId);
            
            if (categoryMatch) {
                // Set the filter state using the category's actual name
                setSelectedCategory(categoryMatch.name); 
            } else {
                setSelectedCategory('All'); // If ID is invalid, show all
            }
        } else {
            // If the URL has no categoryId, or categories haven't loaded yet, keep the default state ('All')
            setSelectedCategory('All'); 
        }

    }, [initialCategoryId, categories]); // <<< Update dependencies

    
    // --- Filtering, Sorting, and Searching Logic (The core logic) ---
    const filteredAndSortedProducts = useMemo(() => {
        let tempProducts = [...products];
        const query = searchTerm.toLowerCase();

        // 1. Filter by Availability
        if (showOnlyAvailable) {
            tempProducts = tempProducts.filter(p => p.isAvailable);
        }
        
        // 2. Filter by Search Term (FIXED: Search by name ONLY)
        if (searchTerm) {
            tempProducts = tempProducts.filter(p => 
                p.name.toLowerCase().includes(query)
            );
        }

        // 3. Filter by Category
        if (selectedCategory !== 'All') {
            tempProducts = tempProducts.filter(p => p.category === selectedCategory);
        }

        // 4. Sort
        switch (sortMethod) {
            case 'price_asc':
                tempProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                tempProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                tempProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest': 
                // Using product.id as a stable sort key if createdAt/date is unavailable
                tempProducts.sort((a, b) => (b.id || 0) - (a.id || 0)); 
                break;
            default: // best_match
                break;
        }

        return tempProducts;
    }, [products, searchTerm, selectedCategory, sortMethod, showOnlyAvailable]);

    const resultCount = filteredAndSortedProducts.length;

    // --- Loading and Error UI ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-700 mb-4 mx-auto"></div>
                    <p className="text-gray-600 font-medium tracking-wide">Loading...</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
                <div className="text-center bg-white p-10 rounded-xl shadow-2xl border border-red-200">
                    <h1 className="text-3xl font-semibold text-red-700 mb-4 tracking-tight">Data Error</h1>
                    <p className="text-gray-700 max-w-lg mb-2 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    // --- Main Render ---
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="container mx-auto px-4 md:px-8 py-10">
                
                {/* --- Header & Search Bar --- */}
                <header className="text-center mb-10 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-4">
                        All Products
                    </h1>
                    <input
    type="search"
    placeholder="Search products by name..." // Updated placeholder
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    // Added text-gray-900, placeholder-gray-500, and bg-white for visibility
    className="w-full max-w-2xl border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 placeholder-gray-500 bg-white"
    aria-label="Search products"
/>
                </header>

                {/* --- Product Filters & Results Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    
                    {/* Filter Sidebar */}
                    <aside className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:h-fit lg:sticky lg:top-4">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                            Refine Products
                        </h2>
                        <div className="space-y-6 text-gray-700">
                            
                            {/* Category Filter */}
                                                        <div>
                                <h3 className="text-base font-medium mb-2">Category</h3>
                                <select 
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm cursor-pointer focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="All">All</option> {/* Manually add the All option */}
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option> // <<< Changed map function
                                    ))}
                                </select>
                            </div>

                            {/* Availability Filter (Toggle) - UNCOMMENTED */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <h3 className="text-base font-medium">Show Available Only</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={showOnlyAvailable} 
                                        onChange={e => setShowOnlyAvailable(e.target.checked)} 
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                        </div>
                    </aside>
                    
                    {/* Product Grid Area */}
                    <section className="lg:col-span-3">
                        {/* Status/Sort Bar */}
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <p className="text-gray-600">
                                Showing <span className="text-indigo-600 font-medium">{resultCount}</span> matching products
                            </p>
                            
                            {/* Sort Dropdown */}
                            <select 
                                value={sortMethod}
                                onChange={e => setSortMethod(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            >
                                <option value="best_match">Sort: Best Match</option>
                                <option value="newest">Sort: Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Name: A to Z</option>
                            </select>
                        </div>
                        
                        {/* Dynamic Product Grid */}
                        {resultCount === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Match Your Criteria</h3>
                                {/* <p className="text-gray-500">
                                    Try expanding your search, selecting 'All' categories, or checking the 'Show Available Only' filter.
                                </p> */}
                            </div>
                        ) : (
                            // Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop
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
