import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useCart } from '../context/CartContext';

const DEFAULT_IMAGE = '/placeholder.jpg';

const ProductCard = ({ product, isPublic }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault(); 

    if (!product.isAvailable) {
      return alert("This product is currently unavailable.");
    }

    addItem(product, 1, () => {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000); 
    });
  };

  const primaryImage = product.images?.[0];
  const imageUrl = primaryImage?.url || DEFAULT_IMAGE;
  const linkUrl = isPublic ? `/product/${product.id}` : `/admin/product/edit/${product.id}`;

  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition duration-300 hover:shadow-xl hover:scale-[1.01]">

      {/* 🚀 PRO TOAST: Elegant Image Overlay */}
      <div 
        className={`absolute inset-0 z-40 flex items-center justify-center transition-all duration-300 pointer-events-none ${
          added ? 'bg-white/80 backdrop-blur-[2px] opacity-100' : 'opacity-0'
        }`}
        style={{ height: 'calc(100% - 140px)' }} // Keeps overlay over image area only
      >
        <div className={`flex flex-col items-center transition-transform duration-500 ${added ? 'scale-100' : 'scale-50'}`}>
          <div className="bg-green-500 text-white p-2 rounded-full shadow-lg mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-gray-900 font-bold text-sm">Added to Cart</span>
        </div>
      </div>

      <Link to={linkUrl} className="block">
        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
          <LazyLoadImage
            src={imageUrl}
            alt={product.name}
            effect="blur"
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = DEFAULT_IMAGE)}
          />

          {product.onPromotion && (
            <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-20">
              Promo
            </span>
          )}

          {!product.isAvailable && ( 
            <span className="absolute top-3 right-3 bg-red-500 text-[10px] font-bold text-white px-3 py-1 rounded-full shadow-sm z-20">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col justify-between">
        <Link to={linkUrl} className="hover:text-indigo-600 transition">
          <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug line-clamp-2 min-h-[44px]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xl font-extrabold text-indigo-600">
            {product.price} DH
          </span>
          {product.onPromotion && (
            <span className="text-gray-400 line-through text-xs">
              {product.previousPrice} DH
            </span>
          )}
        </div>

        {product.isAvailable ? (
          <button
            onClick={handleAdd}
            disabled={added}
            className={`mt-4 w-full text-center py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300 focus:outline-none ${
              added 
              ? 'bg-green-500 text-white' 
              : 'bg-indigo-600 text-white hover:bg-indigo-600'
            }`}
          >
            {added ? '✓ Success' : 'Add To Cart'}
          </button>
        ) : (
          <Link
            to={linkUrl}
            className="mt-4 w-full text-center border border-gray-300 text-indigo-600 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition"
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;