// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// --- Import Public Pages ---
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Shop from "./pages/Shop.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./components/Cart.jsx"; // <-- ensure this file exists
import Checkout from "./pages/Checkout.jsx"; // <-- added Checkout page
import Confirmation from "./pages/Confirmation.jsx"; // <-- added Confirmation page
import ProductPage from "./pages/ProductPage.jsx";
import CategoriesPage from "./pages/CategoriesPage";


// --- Import Dashboard Pages ---
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/dashboard/Products.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Orders from "./pages/dashboard/Orders.jsx";
import Settings from "./pages/dashboard/Settings.jsx";
import WhatsAppButton from "./components/WhatsAppButton";

export default function App() {
      console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/properties" element={<Shop />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Cart route (public) */}
      <Route path="/cart" element={<Cart />} />

      {/* Checkout route (public) */}
      <Route path="/checkout" element={<Checkout />} />

      {/* Confirmation route (public) */}
      <Route path="/confirmation" element={<Confirmation />} />

      <Route path="/properties/:id" element={<ProductPage />} />

      <Route path="/categories" element={<CategoriesPage />} />


      {/* 2. PROTECTED ADMIN ROUTES - Dashboard acts as layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* index route -> /dashboard */}
        <Route index element={<Products />} />
        {/* child routes -> /dashboard/products, /dashboard/categories, ... */}
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 3. Not Found route (must be last) */}
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-gray-800">
            <span className="text-8xl font-black mb-4 text-indigo-500">404</span>

            <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-sm text-center">
              The item or link you were looking for doesn't exist.
            </p>

            <a
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition transform hover:scale-105"
            >
              Continue Shopping
            </a>
          </div>
        }
        
      />
      
    </Routes>
    
    
  );

  
}
