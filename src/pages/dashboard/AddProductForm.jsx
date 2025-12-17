import React, { useState, useEffect } from "react";
import { uploadImagesBatch } from "../../api/productsApi";
import API_URL from "../../config/api";

const BACKEND_URL = API_URL;

// Tailwind utility classes for better styling (YOUR DESIGN)
const inputClasses = "border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 shadow-sm transition w-full";
const selectToggleClasses = "rounded-xl py-3 px-4 border-2 font-semibold cursor-pointer transition w-full";
const fileInputClasses = "w-full p-3 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50 cursor-pointer font-medium text-indigo-700 hover:bg-indigo-100 transition";


export default function AddProductForm({ categories = [], product, onAdd, onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [previousPrice, setPreviousPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(categories[0]?.name || "");
    const [images, setImages] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [onPromotion, setOnPromotion] = useState(false);

    // Sync form when editing (LOGIC FROM YOUR WORKING FILE)
    useEffect(() => {
        if (product) {
            setName(product.name || "");
            setPrice(product.price ?? "");
            setPreviousPrice(product.previousPrice ?? 0);
            setDescription(product.description || "");
            setCategory(product.category || categories[0]?.name || "");

            // **LOGIC RETAINED**: Ensure isAvailable is a boolean value
            let isAvailableValue = true;
            if (product.isAvailable === false || product.isAvailable === "false" || product.isAvailable === 0) {
                isAvailableValue = false;
            }
            setIsAvailable(isAvailableValue);

            setOnPromotion(Boolean(product.onPromotion));

            // **LOGIC RETAINED**: Correctly reconstruct full image URLs for display
            const existingImgs = (product.images || []).map((img, idx) => ({
                url: img.startsWith("http") ? img : BACKEND_URL + img,
                file: null,
                isExisting: true,
                isPrimary: idx === 0,
            }));
            setImages(existingImgs);
        } else {
            // Reset for new product
            setName("");
            setPrice("");
            setPreviousPrice(0);
            setDescription("");
            setCategory(categories[0]?.name || "");
            setImages([]);
            setIsAvailable(true);
            setOnPromotion(false);
        }

        return () => {
            // Cleanup object URLs
            images.forEach(img => {
                if (img?.url?.startsWith("blob:")) {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, [product, categories]);


    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 20);
        const newImages = files.map((file, idx) => ({
            file,
            url: URL.createObjectURL(file),
            isExisting: false,
            isPrimary: images.length === 0 && idx === 0,
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (idx) => {
        setImages(prev => {
            const img = prev[idx];
            if (img?.url?.startsWith("blob:")) URL.revokeObjectURL(img.url);
            const newImgs = prev.filter((_, i) => i !== idx);
            if (img.isPrimary && newImgs.length > 0) newImgs[0].isPrimary = true;
            return newImgs;
        });
    };

    const setPrimaryImage = (idx) => {
        setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛑 BLOCK double submit
    if (isSubmitting) return;

    if (!name || !price) return;

    setIsSubmitting(true); // 🔒 LOCK FORM

    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("previousPrice", onPromotion ? previousPrice : 0);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("isAvailable", isAvailable.toString());
        formData.append("onPromotion", onPromotion.toString());

        const reorderedImages = [...images].sort((a, b) => b.isPrimary - a.isPrimary);

        const newFiles = reorderedImages.filter(img => img.file).map(img => img.file);

        const existingUrlToRelativePathMap = new Map(
            reorderedImages
                .filter(img => img.isExisting)
                .map(img => [img.url, img.url.replace(BACKEND_URL, "")])
        );

        let uploadedUrls = [];
        if (newFiles.length > 0) {
            uploadedUrls = await uploadImagesBatch(newFiles);
        }

        const newFileToRelativePathMap = new Map(
            newFiles.map((file, index) => [file, uploadedUrls[index]])
        );

        const allImages = reorderedImages
            .map(img => {
                if (img.isExisting) return existingUrlToRelativePathMap.get(img.url);
                if (img.file) return newFileToRelativePathMap.get(img.file);
                return null;
            })
            .filter(Boolean);

        formData.append("existingImages", JSON.stringify(allImages));

        await onAdd(
            formData,
            allImages.map((url, i) => ({
                url: url.startsWith("http") ? url : BACKEND_URL + url,
                isPrimary: i === 0,
            }))
        );

        // ✅ Reset form ONLY after success
        setName("");
        setPrice("");
        setPreviousPrice(0);
        setDescription("");
        setCategory(categories[0]?.name || "");
        setImages([]);
        setIsAvailable(true);
        setOnPromotion(false);

    } catch (err) {
        console.error("Create product failed:", err);
        alert("Failed to create product. Try again.");
    } finally {
        setIsSubmitting(false); // 🔓 UNLOCK FORM
    }
};


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-5 p-6 md:p-8 relative">
<button
    type="submit"
    disabled={isSubmitting}
    className={`px-4 py-3 rounded-xl font-extrabold mt-4 shadow-xl transition 
    ${
        isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] text-white"
    }`}
>
    {isSubmitting ? "Creating Product..." : product ? "Save Changes" : "Create Product"}
</button>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 border-b pb-3 mb-2">
                    {product ? "Edit Product" : "Add New Product"}
                </h2>

                {/* Input Fields */}
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Product Name" className={inputClasses} required />
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (DH)" type="number" step="0.01" min="0" className={inputClasses} required />

                {/* Availability and Promotion Toggles (Styled Selects) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Product Availability</label>
                        <select
                            value={isAvailable ? "true" : "false"}
                            onChange={(e) => setIsAvailable(e.target.value === "true")}
                            className={`${selectToggleClasses} ${isAvailable ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}
                            required
                        >
                            <option value="true">🟢 Available</option>
                            <option value="false">🔴 Not Available</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">On Promotion?</label>
                        <select 
                            value={onPromotion ? "true" : "false"}
                            onChange={e => setOnPromotion(e.target.value === "true")} 
                            className={`${selectToggleClasses} ${onPromotion ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-gray-50 border-gray-300 text-gray-700'}`}
                            required
                        >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                </div>

                {onPromotion && (
                    <input value={previousPrice} onChange={e => setPreviousPrice(e.target.value)} placeholder="Previous Price (for comparison)" type="number" step="0.01" min="0" className={`${inputClasses} line-through text-gray-500`} />
                )}

                <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Product Description" 
                    className={`${inputClasses} resize-y min-h-[120px]`} 
                    rows={5}
                />

                <select value={category} onChange={e => setCategory(e.target.value)} className={inputClasses} required>
                    {categories.length === 0 ? <option value="">No categories</option> : categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                {/* Image Management Section */}
                <div className="flex flex-col gap-3 mt-2 p-4 border border-indigo-200 rounded-xl bg-indigo-50">
                    <label className="block font-bold text-lg text-indigo-800">🖼️ Manage Images</label>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className={fileInputClasses} />

                    {images.length > 0 && (
                        <>
                            <div className="flex gap-3 mt-2 overflow-x-auto py-1">
                                {images.map((img, idx) => (
                                    <div key={idx} className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition ${img.isPrimary ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'}`} onClick={() => setPrimaryImage(idx)}>
                                        {img.isPrimary && <span className="absolute top-0 left-0 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-br-lg z-10 font-bold">Primary</span>}
                                        <img src={img.url} alt="product" className="w-full h-full object-cover" />
                                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 transition shadow-md">✕</button>
                                    </div>
                                ))}
                            </div>
                            <span className="text-gray-600 text-sm">{images.length} image{images.length > 1 ? "s" : ""}. Click an image to set it as Primary.</span>
                        </>
                    )}
                </div>

                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-extrabold mt-4 shadow-xl transition transform hover:scale-[1.01]">
                    {product ? "Save Changes" : "Create Product"}
                </button>
            </form>
        </div>
    );
}

