
// Dashboard.jsx (IMMO / Products Only) — FIXED CATEGORIES COUNT
// ✅ "Catégories" card now shows REAL categories count (from categories API), not only used-by-products
// ✅ Keeps your UI + logic the same

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";
import Products from "./dashboard/Products";
import Categories from "./dashboard/Categories";
import Settings from "./dashboard/Settings";
import { getProducts } from "../api/productsApi";
import { getCategories } from "../api/categoriesApi"; // ✅ NEW

// 🚨 Logout Confirmation Modal/Card
const LogoutConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-xs md:max-w-sm text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Se déconnecter ?</h2>
        <p className="mb-6 text-gray-600">Voulez-vous vraiment quitter le dashboard admin ?</p>

        <div className="flex justify-between mt-4 gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 flex-1 font-bold transition"
          >
            Annuler
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white flex-1 font-bold transition"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
};

// Helpers
const asBool = (v) =>
  !(v === false || v === 0 || String(v).toLowerCase() === "false" || v == null);

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Keep categories state for your pages (still passed to Products/Categories)
  const [categories, setCategories] = useState([
    { id: 1, name: "Appartement" },
    { id: 2, name: "Villa" },
  ]);

  // Products
  const [products, setProducts] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // ✅ REAL categories count from backend
  const [categoriesCount, setCategoriesCount] = useState(0);

  const navigate = useNavigate();

  // Logout flow
  const handleLogout = () => {
    setSidebarOpen(false);
    setShowConfirmModal(true);
  };

  const confirmAndPerformLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setShowConfirmModal(false);
  };

  const cancelLogout = () => setShowConfirmModal(false);

  // ✅ Fetch products + categories (for stats + latest)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);

        setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);

        const cats = Array.isArray(catRes?.data) ? catRes.data : [];
        setCategoriesCount(cats.length);

        // Optional: also sync sidebar/pages categories with real backend categories
        // (keeps your UI consistent everywhere)
        if (cats.length > 0) setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setProducts([]);
        setCategoriesCount(0);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // IMMO stats (promo removed)
  const stats = useMemo(() => {
    const total = products.length;

    const available = products.reduce(
      (sum, p) => (asBool(p?.isAvailable) ? sum + 1 : sum),
      0
    );

    // Kept (not used in card anymore, but harmless)
    const uniqueCats = new Set(
      products
        .map((p) => (p?.category ?? p?.type ?? "").toString().trim())
        .filter(Boolean)
    ).size;

    return { total, available, uniqueCats };
  }, [products]);

  const latestListings = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        if (db !== da) return db - da;
        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
      })
      .slice(0, 6);
  }, [products]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Admin</span>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-5 md:p-6">
          {activePage === "dashboard" && (
            <div className="space-y-8">
              {/* Stats (3 cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard
                  title="Total annonces"
                  value={loadingStats ? "…" : stats.total}
                  sub="Toutes catégories"
                  iconBg="bg-indigo-600"
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" />
                    </svg>
                  }
                />

                <StatCard
                  title="Disponibles"
                  value={loadingStats ? "…" : stats.available}
                  sub="Annonces actives"
                  iconBg="bg-emerald-600"
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                {/* ✅ FIXED HERE */}
                <StatCard
                  title="Catégories"
                  value={loadingStats ? "…" : categoriesCount}
                  sub="Toutes catégories"
                  iconBg="bg-sky-600"
                  icon={
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  }
                />
              </div>

              {/* Quick actions */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Actions rapides</h2>
                    <p className="text-sm text-gray-500 mt-1">Ajoutez ou gérez vos annonces rapidement.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePage("products")}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                    >
                      Gérer annonces
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePage("categories")}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      Gérer catégories
                    </button>
                  </div>
                </div>
              </div>

              {/* Latest listings */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">Dernières annonces</h3>
                    <p className="text-xs md:text-sm text-gray-500">Les plus récentes (aperçu)</p>
                  </div>

                  <button
                    onClick={() => setActivePage("products")}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="p-4 md:p-6">
                  {latestListings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucune annonce trouvée.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {latestListings.map((p) => (
                        <ProductCard key={p.id} product={p} isPublic={false} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePage === "products" && <Products categories={categories} setCategories={setCategories} />}

          {activePage === "categories" && <Categories categories={categories} setCategories={setCategories} />}

          {activePage === "settings" && <Settings />}
        </main>
      </div>

      {showConfirmModal && (
        <LogoutConfirmationModal onConfirm={confirmAndPerformLogout} onCancel={cancelLogout} />
      )}
    </div>
  );
}

// ======================
// UI: Stat Card (style improved)
// ======================
function StatCard({ title, value, sub, icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{sub}</p>
        </div>

        <div className={`${iconBg} text-white rounded-2xl p-3 shadow-sm`}>{icon}</div>
      </div>
    </div>
  );
}

