import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 1. NEW: Import useNavigate
// import axios from "axios";
import Sidebar from "../components/Sidebar";
import Card from "../components/ProductCard";
import Products from "./dashboard/Products";
import Categories from "./dashboard/Categories";
import Orders from "./dashboard/Orders";
import Settings from "./dashboard/Settings";
import { getProducts } from "../api/productsApi";
import API_URL from "../config/api";
import api from "../api/axios";


// 🚨 NEW COMPONENT: Logout Confirmation Modal/Card
const LogoutConfirmationModal = ({ onConfirm, onCancel }) => {
    return (
        // Modal Overlay (Fixed position, dark background)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Modal Card (White background, centered) */}
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Logout</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to logout of the Admin Dashboard?</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
// 🚨 END NEW COMPONENT

export default function Dashboard() {
    const [activePage, setActivePage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // 👈 2. NEW STATE: To control the confirmation modal visibility
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [categories, setCategories] = useState([
        { id: 1, name: "Category A" },
        { id: 2, name: "Category B" },
    ]);
    const [orders, setOrders] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);

    const navigate = useNavigate(); // 👈 3. NEW: Initialize useNavigate

    // 4. UPDATED: This function is now called when the sidebar button is clicked. It shows the modal.
    const handleLogout = () => {
        setSidebarOpen(false); // Close sidebar for better mobile experience
        setShowConfirmModal(true); // Open the confirmation modal
    };
    
    // 5. NEW: This function is called when the user confirms the logout on the modal.
    const confirmAndPerformLogout = () => {
        localStorage.removeItem("token");
        
        // 🚨 FIX: Use navigate to redirect, replacing the old window.location.href
        navigate("/"); 
        
        setShowConfirmModal(false);
    };

    // 6. NEW: Function to close the modal if the user cancels.
    const cancelLogout = () => {
        setShowConfirmModal(false);
    };
    // ----------------------------------------------------------------------


      useEffect(() => {
        const fetchOrders = async () => {
          try {
            const res = await api.get("/orders");
            setOrders(res.data);
          } catch (err) {
            console.error("Failed to fetch orders:", err);
          }
        };
        fetchOrders();
      }, []);

  useEffect(() => {
    const fetchProductsCount = async () => {
      try {
        const res = await getProducts();
        setTotalProducts(res.data.length);
      } catch (err) {
        console.error("Failed to fetch products count:", err);
      }
    };
    fetchProductsCount();
  }, []);

  // Calculations for Total Sales and Sales This Month (Keeping original logic: counting 'Delivered' orders)
  const totalSales = orders.reduce(
    (sum, o) => (o.status === "Delivered" ? sum + 1 : sum),
    0
  );
  const currentMonth = new Date().getMonth() + 1;
  const salesThisMonth = orders.reduce((sum, o) => {
    const orderMonth = new Date(o.date).getMonth() + 1;
    return o.status === "Delivered" && orderMonth === currentMonth
      ? sum + 1
      : sum;
  }, 0);

  const latestOrders = orders
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // New Status Color Map based on the provided design image colors
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800", // Yellow dot in image
    Confirmed: "bg-blue-100 text-blue-800", // Blue dot in image
    Delivered: "bg-green-100 text-green-800", // Green dot in image
    Cancelled: "bg-red-100 text-red-800", // Red text in image
  };


  return (
    <div className="flex h-screen bg-gray-100"> {/* Light background */}
      {/* The Sidebar component will handle its own dark styling based on props/internal logic */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout} // 👈 UPDATED: Calls the function that shows the modal
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header: Light background, minimalist */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition"
          >
            {/* Hamburger icon from the original code */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1> {/* Use bold font for Header */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Admin</span>
            {/* Avatar: Blue background for admin initial 'A' */}
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activePage === "dashboard" && (
            <div className="space-y-8"> {/* Increased spacing */}
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Products Card - Design updated to match the image: large shadow, rounded corners */}
                <div className="bg-white rounded-xl shadow-xl p-6"> 
                  <div className="flex items-start"> {/* Align items to start for stacked text */}
                    {/* Icon Area: Use a blue/indigo color scheme for the icon box */}
                    <div className="flex-shrink-0 bg-blue-500 rounded-full p-3 text-white">
                      {/* Original SVG for products (boxes) - changed color to white */}
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl className="text-right"> {/* Align text right */}
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        {/* Larger, bolder number */}
                        <dd className="text-3xl font-extrabold text-gray-900 mt-1">{totalProducts}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                {/* Total Sales Card (Total Delivered Orders in the new design) */}
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-start">
                    {/* Icon Area: Use Green color scheme for sales/delivered */}
                    <div className="flex-shrink-0 bg-green-500 rounded-full p-3 text-white">
                      {/* Original SVG for sales/delivered (check circle) - changed color to white */}
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl className="text-right">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                        <dd className="text-3xl font-extrabold text-gray-900 mt-1">{totalSales}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                
                {/* Sales This Month Card (Keeping original logic: counting 'Delivered' orders this month) */}
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-start">
                    {/* Icon Area: Use Orange/Amber color scheme for time/month */}
                    <div className="flex-shrink-0 bg-amber-500 rounded-full p-3 text-white">
                      {/* Original SVG for time/month (clock) - changed color to white */}
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl className="text-right">
                        <dt className="text-sm font-medium text-gray-500 truncate">Sales This Month</dt>
                        <dd className="text-3xl font-extrabold text-gray-900 mt-1">{salesThisMonth}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Orders */}
              <div className="bg-white shadow-xl rounded-xl">
                <div className="px-6 py-5 sm:p-6"> {/* Increased padding */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Latest Orders</h3> {/* Bolder title */}
                    <button
                      onClick={() => setActivePage("orders")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                      View All
                    </button>
                  </div>
                  <div className="flow-root">
                    <ul className="-my-4 divide-y divide-gray-100"> {/* Lighter divider */}
                      {latestOrders.map((order) => (
                        <li key={order.id} className="py-4">
                          <div className="flex items-center justify-between space-x-4">
                            <div className="flex-shrink-0">
                              {/* User Icon - lighter gray ring, darker text */}
                              <div className="h-8 w-8 rounded-full bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-semibold text-gray-800 truncate"> {/* Bolder name */}
                                {order.customerName}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5"> {/* Smaller date text */}
                                {order.date
                                  ? new Date(order.date).toLocaleString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "No date"}
                              </p>
                            </div>
                            <div>
                              {/* Status Label: Removed padding/full width, using small colored circle */}
                                <div>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === "Pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : order.status === "Confirmed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-gray-900"> {/* Bolder price */}
                                {order.products
                                  ? order.products.reduce(
                                      (sum, p) => sum + p.price * p.quantity,
                                      0
                                    ).toLocaleString()
                                  : 0}{" "}
                                DH
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === "products" && (
            <Products categories={categories} setCategories={setCategories} />
          )}
          {activePage === "categories" && (
            <Categories categories={categories} setCategories={setCategories} />
          )}
          {activePage === "orders" && (
            <Orders orders={orders} setOrders={setOrders} />
          )}
          {activePage === "settings" && <Settings />}
        </main>
      </div>

      {/* 👈 7. NEW: Conditionally render the Confirmation Modal */}
      {showConfirmModal && (
        <LogoutConfirmationModal 
          onConfirm={confirmAndPerformLogout}
          onCancel={cancelLogout}
        />
      )}
    </div>
  );
}