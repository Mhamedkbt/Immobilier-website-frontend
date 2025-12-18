// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createOrder } from "../api/ordersApi";


const formatCurrency = (amount) =>
  `${(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`;

const getProductImage = (img) => {
  if (!img) return "/placeholder.png"; 
  if (img.startsWith("http")) return img;
  return `${process.env.REACT_APP_API_URL || ""}${img.startsWith("/") ? "" : "/"}${img}`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [checkoutInfo, setCheckoutInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    city: "",
    customerAddress: "",
    paymentMethod: "COD",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [isNavigating, setIsNavigating] = useState(false); 
  
  const [fieldErrors, setFieldErrors] = useState({
    customerName: false,
    customerEmail: false,
    customerPhone: false,
    city: false,
    customerAddress: false
  });

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      if (!isNavigating) {
        navigate('/cart');
      }
    }
  }, [cartItems, navigate, isNavigating]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCheckoutInfo((prev) => ({ ...prev, [name]: value }));
    setError("");
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9][0-9\s\-]{7,15}$/;
    const cityRegex = /^[a-zA-Z\s]+$/;
    const addressRegex = /^[a-zA-Z0-9\s,.-]+$/; // Slightly relaxed for common address chars
    
    const newFieldErrors = {
      customerName: !checkoutInfo.customerName.trim() || !nameRegex.test(checkoutInfo.customerName),
      customerEmail: !checkoutInfo.customerEmail.trim() || !emailRegex.test(checkoutInfo.customerEmail),
      customerPhone: !checkoutInfo.customerPhone.trim() || !phoneRegex.test(checkoutInfo.customerPhone),
      city: !checkoutInfo.city.trim() || !cityRegex.test(checkoutInfo.city),
      customerAddress: !checkoutInfo.customerAddress.trim() || !addressRegex.test(checkoutInfo.customerAddress)
    };
    
    setFieldErrors(newFieldErrors);

    if (newFieldErrors.customerName) return "Enter a valid full name.";
    if (newFieldErrors.customerEmail) return "Enter a valid email address.";
    if (newFieldErrors.customerPhone) return "Enter a valid phone number.";
    if (newFieldErrors.city) return "Enter a valid city.";
    if (newFieldErrors.customerAddress) return "Enter a valid address.";

    return null;
  };

  const handleCheckout = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...checkoutInfo,
        date: new Date().toISOString(),
        status: "Pending",
        products: cartItems,
      };

      await createOrder(payload);
      
      const orderDetails = {
        ...checkoutInfo,
        orderNumber: Math.floor(Math.random() * 1000000),
        total: cartTotal,
        date: new Date().toISOString()
      };
      
      setIsNavigating(true);
      
      setTimeout(() => {
        setSuccess(true);
        navigate('/confirmation', { 
          state: { orderDetails },
          replace: true 
        });
        setTimeout(() => {
          clearCart();
        }, 100);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to create order. Please try again.");
      setIsNavigating(false);
      setIsSubmitting(false); 
    }
};

  if (!cartItems || cartItems.length === 0) {
    if (isNavigating) {
      return null; 
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Checkout</h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT — ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-4">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 rounded-xl border overflow-hidden shadow-sm flex-shrink-0">
                      <img
                        src={getProductImage(item.imageUrl || item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-xl mb-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-indigo-700">Secure checkout powered by our encrypted payment system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Customer Information</h2>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className={`relative ${focusedInput === 'customerName' ? 'z-10' : ''}`}>
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <label className={`absolute left-10 transition-all ${focusedInput === 'customerName' || checkoutInfo.customerName ? 'text-xs text-indigo-600 -top-2 bg-white px-1' : 'text-gray-500 top-3.5'}`}>Full Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={checkoutInfo.customerName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setCheckoutInfo(prev => ({ ...prev, customerName: val }));
                      if (fieldErrors.customerName) setFieldErrors(p => ({...p, customerName: false}));
                    }}
                    onFocus={() => setFocusedInput('customerName')}
                    onBlur={() => setFocusedInput('')}
                    className={`w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition ${focusedInput === 'customerName' || checkoutInfo.customerName ? 'pt-5' : ''} ${fieldErrors.customerName ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className={`relative ${focusedInput === 'customerEmail' ? 'z-10' : ''}`}>
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <label className={`absolute left-10 transition-all ${focusedInput === 'customerEmail' || checkoutInfo.customerEmail ? 'text-xs text-indigo-600 -top-2 bg-white px-1' : 'text-gray-500 top-3.5'}`}>Email</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={checkoutInfo.customerEmail}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput('customerEmail')}
                    onBlur={() => setFocusedInput('')}
                    className={`w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition ${focusedInput === 'customerEmail' || checkoutInfo.customerEmail ? 'pt-5' : ''} ${fieldErrors.customerEmail ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className={`relative ${focusedInput === 'customerPhone' ? 'z-10' : ''}`}>
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <label className={`absolute left-10 transition-all ${focusedInput === 'customerPhone' || checkoutInfo.customerPhone ? 'text-xs text-indigo-600 -top-2 bg-white px-1' : 'text-gray-500 top-3.5'}`}>Phone</label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={checkoutInfo.customerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^+0-9\s\-]/g, "");
                      setCheckoutInfo(prev => ({ ...prev, customerPhone: val }));
                      if (fieldErrors.customerPhone) setFieldErrors(p => ({...p, customerPhone: false}));
                    }}
                    onFocus={() => setFocusedInput('customerPhone')}
                    onBlur={() => setFocusedInput('')}
                    className={`w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition ${focusedInput === 'customerPhone' || checkoutInfo.customerPhone ? 'pt-5' : ''} ${fieldErrors.customerPhone ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className={`relative ${focusedInput === 'city' ? 'z-10' : ''}`}>
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <label className={`absolute left-10 transition-all ${focusedInput === 'city' || checkoutInfo.city ? 'text-xs text-indigo-600 -top-2 bg-white px-1' : 'text-gray-500 top-3.5'}`}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={checkoutInfo.city}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setCheckoutInfo(prev => ({ ...prev, city: val }));
                      if (fieldErrors.city) setFieldErrors(p => ({...p, city: false}));
                    }}
                    onFocus={() => setFocusedInput('city')}
                    onBlur={() => setFocusedInput('')}
                    className={`w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition ${focusedInput === 'city' || checkoutInfo.city ? 'pt-5' : ''} ${fieldErrors.city ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>

              <div className={`relative mb-6 ${focusedInput === 'customerAddress' ? 'z-10' : ''}`}>
                <div className="absolute left-3 top-3.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <label className={`absolute left-10 transition-all ${focusedInput === 'customerAddress' || checkoutInfo.customerAddress ? 'text-xs text-indigo-600 -top-2 bg-white px-1' : 'text-gray-500 top-3.5'}`}>Address</label>
                <input
                  type="text"
                  name="customerAddress"
                  value={checkoutInfo.customerAddress}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, "");
                    setCheckoutInfo(prev => ({ ...prev, customerAddress: val }));
                    if (fieldErrors.customerAddress) setFieldErrors(p => ({...p, customerAddress: false}));
                  }}
                  onFocus={() => setFocusedInput('customerAddress')}
                  onBlur={() => setFocusedInput('')}
                  className={`w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition ${focusedInput === 'customerAddress' || checkoutInfo.customerAddress ? 'pt-5' : ''} ${fieldErrors.customerAddress ? 'border-red-500' : ''}`}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div 
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${checkoutInfo.paymentMethod === 'COD' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setCheckoutInfo(prev => ({ ...prev, paymentMethod: 'COD' }))}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${checkoutInfo.paymentMethod === 'COD' ? 'border-indigo-500' : 'border-gray-400'}`}>
                        {checkoutInfo.paymentMethod === 'COD' && <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when you receive</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-2 border-gray-200 rounded-xl p-4 opacity-50 cursor-not-allowed">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border-2 mr-3 border-gray-400"></div>
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-gray-500">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-lg font-extrabold shadow-xl transition flex items-center justify-center
                ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Your information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}