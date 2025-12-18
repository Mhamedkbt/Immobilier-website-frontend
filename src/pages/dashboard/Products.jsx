import React, { useState, useEffect, useCallback } from "react";
// Assuming AddProductForm handles its own file inputs and submits FormData
import AddProductForm from "./AddProductForm"; 
import { getProducts, addProduct, updateProduct, deleteProduct } from "../../api/productsApi";
import { getCategories } from "../../api/categoriesApi";
import API_URL from "../../config/api"; 
/**
 * Utility function to robustly convert various API return values (string/number/boolean) 
 * into a strict boolean (true or false).
 */
const parseBoolean = (value) => {
    // Returns false if value is null, undefined, 0, false, or the string "false"
    if (value === false || value === 0 || String(value).toLowerCase() === "false" || value === null || value === undefined) {
        return false;
    }
    // Everything else is treated as true (including the string "true", 1, or true)
    return true;
};

// --- Product Card Component (Encapsulated and Optimized) ---
// Props now use a cleaner object destructuring.
const ProductCard = ({ product, onEdit, onDelete }) => {
    // Use an absolute placeholder if images are missing or empty
    const defaultImage = "/no-image.png"; 
    const imageUrl = product.images?.[0] || defaultImage;
    
    // Status badges using modern pill styling and Tailwind JIT-safe classes
    const AvailabilityBadge = product.isAvailable 
        ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 shadow-sm">Available</span>
        : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 shadow-sm">Unavailable</span>;

    const PromotionPill = product.onPromotion 
        ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 shadow-sm">Promotion</span>
        : null;

    return (
        <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-4 flex flex-col h-full overflow-hidden"
            aria-labelledby={`product-name-${product.id}`}
        >
            <div className="relative mb-3">
                {/* Image Section */}
                <img
                    src={imageUrl}
                    alt={product.name}
                    // Aspect ratio fix with object-cover and fixed height
                    className="w-full h-40 object-cover rounded-lg border border-gray-100"
                    onError={e => { 
                        if (e.target.src !== defaultImage) {
                            e.target.src = defaultImage; 
                            e.target.alt = "Image not available";
                        }
                    }}
                />
                <div className="absolute top-2 left-2">{PromotionPill}</div>
                <div className="absolute bottom-2 right-2">{AvailabilityBadge}</div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
                {/* Product Name (Truncated for clean look) */}
                <h2 id={`product-name-${product.id}`} className="font-extrabold text-lg text-gray-900 truncate" title={product.name}>
                    {product.name}
                </h2>
                {/* Category & Description */}
                <p className="text-indigo-600 text-sm font-medium">{product.category}</p>
                <p className="text-gray-500 text-xs overflow-hidden h-8 line-clamp-2 mt-1">{product.description}</p>
                
                {/* Price Display */}
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

            {/* Action Buttons (Full-width mobile, fixed layout) */}
            <div className="flex justify-between mt-4 gap-3 pt-3 border-t border-gray-100">
                <button
                    onClick={() => onEdit(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl shadow-md transition flex-1 text-sm flex items-center justify-center font-semibold"
                    aria-label={`Edit ${product.name}`}
                >
                    <i className="fas fa-edit mr-1"></i> Edit
                </button>
                <button
                    onClick={() => onDelete(product.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl shadow-md transition flex-1 text-sm flex items-center justify-center font-semibold"
                    aria-label={`Delete ${product.name}`}
                >
                    <i className="fas fa-trash-alt mr-1"></i> Delete
                </button>
            </div>
        </div>
    );
};
// --- End Product Card Component ---


export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    // State to manage both Add/Edit form visibility and data
    const [modalState, setModalState] = useState({
        showForm: false,
        editProduct: null, // Holds product data for editing
        deleteProductId: null // Holds ID for deletion confirmation
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    // Destructure for cleaner use
    const { showForm, editProduct, deleteProductId } = modalState;

    /**
     * Process raw API product data into normalized format (e.g., full image URL, strict booleans).
     * @param {object} product - Raw product object from the API.
     * @returns {object} - Processed product object.
     */
    const processProductData = useCallback((product) => {
        return {
            ...product,
            // If the URL is already a full Cloudinary link (starts with http), leave it
            // Otherwise (unlikely now), add the BACKEND_URL.
            images: (product.images || []).map(img => 
                img.startsWith("http") ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`
            ),
            isAvailable: parseBoolean(product.isAvailable), 
            onPromotion: parseBoolean(product.onPromotion), 
        };
    }, []);


    // --- Data Fetching Logic ---
    const fetchProducts = useCallback(async () => {
        try {
            const res = await getProducts();
            const processedProducts = res.data.map(processProductData);
            setProducts(processedProducts);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            // Optionally set an error state here
        }
    }, [processProductData]);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts]);

    // --- CRUD Handlers ---

    const handleOpenAddForm = () => setModalState({ showForm: true, editProduct: null, deleteProductId: null });
    const handleOpenEditForm = (product) => setModalState({ showForm: true, editProduct: product, deleteProductId: null });
    const handleCloseForm = () => setModalState(prev => ({ ...prev, showForm: false, editProduct: null }));

    const handleOpenDeleteModal = (productId) => setModalState(prev => ({ ...prev, deleteProductId: productId }));
    const handleCloseDeleteModal = () => setModalState(prev => ({ ...prev, deleteProductId: null }));


    /**
     * Handles both adding a new product and updating an existing one.
     * newImagesPreview is only used for immediate UX feedback on ADD, not for API call.
     */
    const handleAddOrEdit = async (productData, newImagesPreview = []) => {
        try {
            let res;
            
            if (editProduct) {
                // Update existing product
                res = await updateProduct(editProduct.id, productData);
            } else {
                // Add new product
                res = await addProduct(productData);
            }

            // Process the received product data
            const processedProduct = processProductData(res.data);

            if (editProduct) {
                // Update product in state
                setProducts(products.map(p => (p.id === processedProduct.id ? processedProduct : p)));
            } else {
                // Add new product to state (using local image preview for quick UX if available)
                const imagesForState = newImagesPreview.length > 0 
                    ? newImagesPreview.map(i => i.url) // Use local preview URLs
                    : processedProduct.images;        // Use actual processed URLs

                setProducts(prev => [{ ...processedProduct, images: imagesForState }, ...prev]);
            }

            handleCloseForm();
            // Fetch again (optional, good for ensuring consistency if image upload is async)
            // await fetchProducts();

        } catch (err) {
            console.error("Failed to add/update product:", err.response?.data || err.message);
            alert(`Operation failed: ${err.response?.data?.message || err.message}. Check console for details.`);
        }
    };

    const handleDeleteProduct = async () => {
        if (!deleteProductId) return;
        try {
            await deleteProduct(deleteProductId);
            setProducts(products.filter(p => p.id !== deleteProductId));
            handleCloseDeleteModal();
        } catch (err) {
            console.error("Failed to delete product:", err.response?.data || err.message);
            alert("Failed to delete product. Try again.");
        }
    };

    // --- Filtering Logic ---
    const filteredProducts = products.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = filterCategory ? p.category === filterCategory : true;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
             {/*  */}

            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 md:mb-0 flex items-center">
                    📦 Product Catalog
                </h1>
                
                {/* Search, Filter, and Add Button Container (Responsive Grid/Flex) */}
<div className="flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-row lg:w-auto gap-3 w-full items-center">
    {/* Search Input */}
    <input
        type="search"
        placeholder="Search products..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        // Added text-gray-900, placeholder-gray-500, and bg-white for mobile visibility
        className="border-2 border-gray-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 w-full sm:col-span-2 transition text-gray-900 placeholder-gray-500 bg-white"
        aria-label="Search products"
    />
                    
                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="border-2 border-gray-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 w-full transition cursor-pointer"
                        aria-label="Filter by category"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                    
                    {/* Add Product Button */}
                    <button
                        onClick={handleOpenAddForm}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition transform hover:-translate-y-0.5 w-full text-sm flex items-center justify-center min-w-[150px]"
                        aria-label="Add a new product"
                    >
                        <i className="fas fa-plus mr-2"></i> Add Product
                    </button>
                </div>
            </div>
    
            {/* Product Display Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
                    Existing Products ({filteredProducts.length}) 
                </h2>
                
                {/* Product Display (Responsive Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onEdit={handleOpenEditForm} 
                            onDelete={handleOpenDeleteModal} 
                        />
                    ))}

                    {/* No Results Message */}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-500 font-medium">
                                No products found matching your criteria. Try adjusting the search or filter.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Delete Confirmation Modal */}
            {deleteProductId && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm transition-opacity" role="dialog" aria-modal="true" aria-labelledby="delete-title">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs md:max-w-sm text-center transform transition-transform scale-100">
                        <h2 id="delete-title" className="text-2xl font-bold text-gray-800 mb-3">
                            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i> Confirm Deletion
                        </h2>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex justify-between mt-4 gap-3">
                            <button 
                                onClick={handleCloseDeleteModal} 
                                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1 font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteProduct} 
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex-1 font-semibold transition"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
    
            {/* Add/Edit Product Form Modal */}
            {showForm && (
                <AddProductForm
                    categories={categories}
                    product={editProduct} // Will be null for add mode
                    onAdd={handleAddOrEdit} // Handles both add and edit logic
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}


