// ProductListing.jsx (IMMO PRO UI + Budget PriceRangeDropdown)
// ✅ PC: 3 cards/row | Mobile: 1 card/row
// ✅ Mobile UI like Sarouty-ish: big search + quick filters + collapsible filters
// ✅ Keeps: URL sync, scroll on mobile search icon, filters, sorting, WhatsAppButton

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getProducts } from "../api/productsApi.js";
import { getCategories } from "../api/categoriesApi.js";
import ProductCard from "../components/ProductCard.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import API_URL from "../config/api";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import PriceRangeDropdown from "../components/PriceRangeDropdown.jsx";

const BACKEND_URL = API_URL;

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (String(path).startsWith("http")) return path;
  const normalizedPath = String(path).replace(/\\/g, "/");
  return normalizedPath.startsWith("/")
    ? `${BACKEND_URL}${normalizedPath}`
    : `${BACKEND_URL}/${normalizedPath}`;
};

const parseBoolean = (value) =>
  !(value === false || value === 0 || String(value).toLowerCase() === "false" || value == null);

const nfmt = (n) => {
  if (n == null || n === "") return "";
  const x = Number(n);
  if (Number.isNaN(x)) return "";
  return new Intl.NumberFormat("fr-FR").format(x);
};

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Scroll target (mobile)
  const productSectionRef = useRef(null);

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------- URL params (IMMO)
  const initialPurpose = (searchParams.get("purpose") || "").toUpperCase(); // RENT | SALE
  const initialCategory = searchParams.get("category") || "All"; // category name
  const initialAddress = searchParams.get("address") || "";
  const initialMinPrice = searchParams.get("minPrice");
  const initialMaxPrice = searchParams.get("maxPrice");
  const initialMinSurface = searchParams.get("minSurface");
  const initialMaxSurface = searchParams.get("maxSurface");

  // --------- Filters (UI state)
  const [searchTerm, setSearchTerm] = useState(initialAddress);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [purpose, setPurpose] = useState(initialPurpose || "ALL"); // ALL | RENT | SALE
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  // ✅ Budget (PriceRangeDropdown)
  const [priceRange, setPriceRange] = useState([
    initialMinPrice ? Number(initialMinPrice) : 0,
    initialMaxPrice ? Number(initialMaxPrice) : 40_000_000,
  ]);

  // Surface range
  const [surfaceMin, setSurfaceMin] = useState(initialMinSurface || "");
  const [surfaceMax, setSurfaceMax] = useState(initialMaxSurface || "");

  // Sorting
  const [sortMethod, setSortMethod] = useState("newest");

  // Mobile: collapse filters
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // --------- Process product data
  const processProductData = useCallback((product) => {
    const normalizeImageObject = (imageObject) => {
      const imagePath = imageObject?.path || imageObject;
      if (!imagePath) return null;
      return { url: getFullImageUrl(imagePath), blurHash: imageObject?.blurHash || null };
    };

    return {
      ...product,
      images: (product.images || []).map(normalizeImageObject).filter((img) => img?.url),
      isAvailable: parseBoolean(product.isAvailable),
      onPromotion: parseBoolean(product.onPromotion),

      // normalized fields for filtering/search (safe fallback keys)
      _title: String(product.title || product.name || "").toLowerCase(),
      _address: String(product.address || product.city || product.location || "").toLowerCase(),
      _category: String(product.category || product.type || "").toLowerCase(),
      _purpose: String(product.purpose || product.transaction || "").toUpperCase(), // RENT/SALE maybe
      _price: Number(product.price ?? product.currentPrice ?? 0) || 0,
      _surface: Number(product.surfaceM2 ?? product.surface ?? product.area ?? product.size ?? 0) || 0,
    };
  }, []);

  // --------- Fetch data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [productResponse, categoryResponse] = await Promise.all([getProducts(), getCategories()]);
        setProducts((productResponse.data || []).map(processProductData));
        setCategories(categoryResponse.data || []);
      } catch (err) {
        console.error(err);
        setError(`Connection Error: Could not fetch data. Check if your server is running at ${BACKEND_URL}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [processProductData]);

  // --------- Keep URL in sync (shareable link)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (purpose && purpose !== "ALL") params.set("purpose", purpose);
    else params.delete("purpose");

    if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
    else params.delete("category");

    if (searchTerm && searchTerm.trim()) params.set("address", searchTerm.trim());
    else params.delete("address");

    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));

    if (surfaceMin !== "") params.set("minSurface", String(surfaceMin));
    else params.delete("minSurface");

    if (surfaceMax !== "") params.set("maxSurface", String(surfaceMax));
    else params.delete("maxSurface");

    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purpose, selectedCategory, searchTerm, priceRange, surfaceMin, surfaceMax]);

  // --------- Scroll down on mobile (search icon)
  const handleSearchIconClick = () => {
    if (window.innerWidth < 1024) {
      productSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --------- Filtering + Sorting
  const filteredAndSortedProducts = useMemo(() => {
    const q = (searchTerm || "").toLowerCase().trim();
    const cat = (selectedCategory || "All").toLowerCase().trim();
    const [minP, maxP] = priceRange;

    const minS = surfaceMin !== "" ? Number(surfaceMin) : null;
    const maxS = surfaceMax !== "" ? Number(surfaceMax) : null;

    let temp = products.filter((p) => {
      const matchesSearch =
        !q ||
        p._title.includes(q) ||
        p._address.includes(q) ||
        String(p.description || "").toLowerCase().includes(q);

      const matchesCategory = cat === "all" || p._category === cat;
      const matchesPurpose = purpose === "ALL" || !p._purpose || p._purpose === purpose;
      const matchesAvailability = !showOnlyAvailable || p.isAvailable;

      const priceVal = p._price;
      const matchesPrice = priceVal >= minP && priceVal <= maxP;

      const surfaceVal = p._surface;
      const matchesSurface =
        (minS == null || surfaceVal >= minS) && (maxS == null || surfaceVal <= maxS);

      return matchesSearch && matchesCategory && matchesPurpose && matchesAvailability && matchesPrice && matchesSurface;
    });

    if (sortMethod === "price_asc") temp.sort((a, b) => a._price - b._price);
    else if (sortMethod === "price_desc") temp.sort((a, b) => b._price - a._price);
    else if (sortMethod === "name_asc")
      temp.sort((a, b) =>
        String(a.title || a.name).localeCompare(String(b.title || b.name))
      );
    else if (sortMethod === "newest") temp.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

    return temp;
  }, [products, searchTerm, selectedCategory, purpose, showOnlyAvailable, priceRange, surfaceMin, surfaceMax, sortMethod]);

  const resultCount = filteredAndSortedProducts.length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setPurpose("ALL");
    setShowOnlyAvailable(true);
    setPriceRange([0, 40_000_000]);
    setSurfaceMin("");
    setSurfaceMax("");
    setSortMethod("newest");
  };

  // ---------------- UI helpers (chips)
  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full font-semibold transition border
        px-3 py-1 text-xs
        sm:px-4 sm:py-2 sm:text-sm
        ${active
          ? "bg-indigo-600 text-white border-indigo-600 shadow"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
        }`}
    >
      {children}
    </button>
  );  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-700 mb-4 mx-auto" />
          <p className="text-gray-600 font-medium tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-red-200">
          <h1 className="text-3xl font-semibold text-red-700 mb-4 tracking-tight">Data Error</h1>
          <p className="text-gray-700 max-w-lg mb-2 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Top hero/header (more pro) */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <main className="container mx-auto px-4 md:px-8 pt-8 pb-6">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
              ← Accueil
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-indigo-700">{resultCount}</span>
              <span>annonce(s)</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 md:p-7">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Annonces immobilières
                </h1>
                <p className="mt-1 text-gray-600">
                  Trouvez votre bien • Filtrez par transaction, type, budget et surface
                </p>
              </div>

              {/* Sort (desktop) */}
              <div className="hidden md:block">
                <label className="text-xs font-bold text-gray-600">Trier</label>
                <select
                  value={sortMethod}
                  onChange={(e) => setSortMethod(e.target.value)}
                  className="mt-1 w-56 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Plus récentes</option>
                  <option value="price_asc">Prix: Croissant</option>
                  <option value="price_desc">Prix: Décroissant</option>
                  <option value="name_asc">Nom: A → Z</option>
                </select>
              </div>
            </div>

            {/* Search row */}
            <div className="mt-5">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Ville, quartier, titre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchIconClick()}
                  className="w-full border border-gray-200 px-5 py-4 pr-14 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-900 placeholder-gray-400 bg-white"
                  aria-label="Search properties"
                />
                <button
                  type="button"
                  onClick={handleSearchIconClick}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label="Search"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Quick chips (mobile-first, like Sarouty) */}
              <div className=" no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto pb-1">
              <Chip active={purpose === "ALL"} onClick={() => setPurpose("ALL")}>Tous</Chip>
                <Chip active={purpose === "SALE"} onClick={() => setPurpose("SALE")}>Acheter</Chip>
                <Chip active={purpose === "RENT"} onClick={() => setPurpose("RENT")}>Louer</Chip>

                <button
  type="button"
  onClick={() => setMobileFiltersOpen((s) => !s)}
  className="ml-auto inline-flex items-center rounded-full border border-gray-200 bg-white
             px-3 py-1 text-xs font-bold text-gray-800 hover:bg-gray-50 gap-1.5
             sm:px-4 sm:py-2 sm:text-sm sm:gap-2"
>

                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                  </svg>
                  Filtres
                </button>
              </div>

              {/* Mobile filters panel */}
              <div className={`${mobileFiltersOpen ? "block" : "hidden"} mt-4 md:hidden`}>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-extrabold text-gray-900">Filtres</p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Category */}
                    <div>
                      <label className="text-xs font-bold text-gray-700">Type de bien</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="All">Tous</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="text-xs font-bold text-gray-700">Budget (DH)</label>
                      <div className="mt-1 h-[52px]">
                        <PriceRangeDropdown
                          value={priceRange}
                          onChange={setPriceRange}
                          min={0}
                          max={40_000_000}
                          step={10_000}
                        />
                      </div>
                    </div>

                    {/* Surface */}
                    <div>
                      <label className="text-xs font-bold text-gray-700">Surface (m²)</label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <input
                          value={surfaceMin}
                          onChange={(e) => setSurfaceMin(e.target.value)}
                          inputMode="numeric"
                          placeholder="Min"
                          className="w-full border border-gray-200 placeholder-gray-400 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          value={surfaceMax}
                          onChange={(e) => setSurfaceMax(e.target.value)}
                          inputMode="numeric"
                          placeholder="Max"
                          className="w-full border border-gray-200 placeholder-gray-400 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    

                  </div>
                </div>
              </div>

              {/* Desktop summary line */}
              <div className="hidden md:flex items-center gap-2 mt-4 text-sm text-gray-600">
                <span className="font-semibold text-indigo-700">{resultCount}</span>
                <span>annonce(s)</span>
                
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Body */}
      <main className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-gray-900">Filtres</h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction */}
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Transaction</p>
                  <div className="inline-flex bg-gray-100 rounded-full p-1 w-fit">
                    <button
                      type="button"
                      onClick={() => setPurpose("ALL")}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        purpose === "ALL" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose("SALE")}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        purpose === "SALE" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      Acheter
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose("RENT")}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        purpose === "RENT" ? "bg-indigo-600 text-white shadow" : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      Louer
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Type de bien</p>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">Tous</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Budget (DH)</p>
                  <div className="h-[52px]">
                    <PriceRangeDropdown
                      value={priceRange}
                      onChange={setPriceRange}
                      min={0}
                      max={40_000_000}
                      step={10_000}
                    />
                  </div>
                </div>

                {/* Surface */}
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Surface (m²)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={surfaceMin}
                      onChange={(e) => setSurfaceMin(e.target.value)}
                      inputMode="numeric"
                      placeholder="Min"
                      className="w-full border text-gray-900 border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      value={surfaceMax}
                      onChange={(e) => setSurfaceMax(e.target.value)}
                      inputMode="numeric"
                      placeholder="Max"
                      className="w-full border text-gray-900 border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                

                <div className="pt-2">
                  <Link to="/" className="text-xs font-bold text-gray-600 hover:text-gray-900">
                    ← Retour à l’accueil
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section ref={productSectionRef} className="lg:col-span-9">
            {/* Mobile sort */}
            <div className="md:hidden mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-700">{resultCount}</span> annonce(s)
              </p>

              <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
                className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Plus récentes</option>
                <option value="price_asc">Prix: Croissant</option>
                <option value="price_desc">Prix: Décroissant</option>
                <option value="name_asc">Nom: A → Z</option>
              </select>
            </div>

            {resultCount === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Aucune annonce ne correspond</h3>
                <p className="text-gray-600">Essaie de modifier les filtres.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-indigo-700"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              // ✅ Mobile: 1 card/row | PC: 3 cards/row
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} isPublic={true} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
