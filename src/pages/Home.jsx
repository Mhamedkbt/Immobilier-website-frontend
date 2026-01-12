import React, { useState, useEffect, useCallback } from "react";
import { getProducts as getProperties } from "../api/productsApi.js";
import { getCategories as getPropertyTypes } from "../api/categoriesApi.js";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import API_URL from "../config/api";
import PriceRangeDropdown from "../components/PriceRangeDropdown.jsx";
import LocationAutocomplete from "../components/LocationAutocomplete.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";


const BACKEND_URL = API_URL;

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const p = path.replace(/\\/g, "/");
  return p.startsWith("/") ? `${BACKEND_URL}${p}` : `${BACKEND_URL}/${p}`;
};

const parseBoolean = (v) =>
  !(v === false || v === 0 || String(v).toLowerCase() === "false" || v == null);

// =========================================================================
// 🌟 SUB-COMPONENTS
// =========================================================================

const PropertyTypeTile = ({ type }) => (
  <Link
    to={`/properties?category=${encodeURIComponent(type.name)}`}
    className="group block relative overflow-hidden h-64 bg-gray-900 rounded-xl shadow-xl border border-gray-700 transition transform duration-300 hover:shadow-2xl hover:border-indigo-500 hover:scale-[1.03]"
  >
    {type.imageUrl ? (
      <LazyLoadImage
        src={type.imageUrl}
        alt={type.name}
        effect="blur"
        height="100%"
        width="100%"
        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
      />
    ) : (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <span className="text-gray-300 text-lg font-semibold">{type.name}</span>
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
      <h3 className="text-2xl font-bold text-white tracking-wide transition-colors duration-300 group-hover:text-indigo-400 uppercase">
        {type.name}
      </h3>
      <p className="text-sm text-gray-200 mt-1 flex items-center">
        Browse listings
        <svg
          className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </p>
    </div>
  </Link>
);

const HeroSearch = ({ types }) => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState("sale");

  const [address, setAddress] = useState("");
  const [typeId, setTypeId] = useState("");
  const [priceRange, setPriceRange] = useState([4_170_000, 40_000_000]);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    params.set("purpose", purpose === "rent" ? "RENT" : "SALE");

    if (typeId) {
      const selectedType = types.find((t) => String(t.id) === String(typeId));
      if (selectedType?.name) params.set("category", selectedType.name);
    }

    if (address.trim()) params.set("address", address.trim());

    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-6xl mt-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-black/5 ring-1 ring-black/5"
    >
      {/* Top row */}
      <div className="px-4 md:px-6 pt-5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex bg-gray-100 rounded-full p-1 w-fit">
          <button
            type="button"
            onClick={() => setPurpose("sale")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              purpose === "sale"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Acheter
          </button>
          <button
            type="button"
            onClick={() => setPurpose("rent")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              purpose === "rent"
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            Louer
          </button>
        </div>

        <Link
          to="/properties"
          className="text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          Voir toutes les annonces →
        </Link>
      </div>

      {/* Inputs */}
      <div className="px-4 md:px-6 pb-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          {/* Ville */}
          <div className="md:col-span-5">
            <LocationAutocomplete value={address} onChange={setAddress} />
          </div>

          {/* Type */}
          <div className="md:col-span-4">
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="h-[52px] w-full bg-white border border-gray-200 rounded-2xl px-4 outline-none text-gray-900 shadow-sm"
            >
              <option value="">Type de bien</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div className="md:col-span-3">
            {/* IMPORTANT: keep dropdown working and not clipped */}
            <div className="h-[52px] relative z-[60]">
              <PriceRangeDropdown
                value={priceRange}
                onChange={setPriceRange}
                min={0}
                max={40_000_000}
                step={10_000}
              />
            </div>
          </div>

          {/* Button row */}
          <div className="md:col-span-12 pt-1">
            <button
              type="submit"
              className="w-full h-[54px] bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl px-6 transition shadow-lg"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

const WhyChooseUsImmo = () => (
  <section className="container mx-auto px-4 md:px-8 my-20">
    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 tracking-tight text-center">
      Why Choose Us?
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div className="p-8 border border-gray-200 rounded-xl bg-white shadow-lg transition duration-300 hover:shadow-xl hover:scale-[1.02]">
        <i className="fa-solid fa-house-chimney text-4xl text-indigo-600 mb-4"></i>
        <h3 className="font-bold text-xl mb-2 text-gray-800">Verified Listings</h3>
        <p className="text-gray-600">
          High-quality listings with clear details, photos, and fast updates.
        </p>
      </div>
      <div className="p-8 border border-gray-200 rounded-xl bg-white shadow-lg transition duration-300 hover:shadow-xl hover:scale-[1.02]">
        <i className="fa-solid fa-headset text-4xl text-indigo-600 mb-4"></i>
        <h3 className="font-bold text-xl mb-2 text-gray-800">Expert Support</h3>
        <p className="text-gray-600">
          We help you schedule visits and connect with trusted agents.
        </p>
      </div>
      <div className="p-8 border border-gray-200 rounded-xl bg-white shadow-lg transition duration-300 hover:shadow-xl hover:scale-[1.02]">
        <i className="fa-solid fa-shield-halved text-4xl text-indigo-600 mb-4"></i>
        <h3 className="font-bold text-xl mb-2 text-gray-800">Secure & Private</h3>
        <p className="text-gray-600">
          Your contact details are protected. Message safely through the platform.
        </p>
      </div>
    </div>
  </section>
);

// =========================================================================
// --- Main Home Component ---
// =========================================================================

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processPropertyData = useCallback((property) => {
    const normalizeImageObject = (img) => {
      const imagePath = img?.path || img;
      if (!imagePath) return null;
      return { url: getFullImageUrl(imagePath), blurHash: img?.blurHash || null };
    };
    return {
      ...property,
      images: (property.images || [])
        .map(normalizeImageObject)
        .filter((i) => i?.url),
      isAvailable: parseBoolean(property.isAvailable),
      featured: parseBoolean(property.featured || property.onPromotion),
    };
  }, []);

  const processTypeData = useCallback((type) => {
    const imagePath = type.image?.path || type.image;
    return { ...type, imageUrl: getFullImageUrl(imagePath) };
  }, []);

  useEffect(() => {
    const heroImg = new Image();
    heroImg.src = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg";

    (async () => {
      try {
        const [propertyResponse, typeResponse] = await Promise.all([
          getProperties(),
          getPropertyTypes(),
        ]);

        setProperties(
          (propertyResponse.data || [])
            .map(processPropertyData)
            .filter((p) => p.isAvailable)
            .slice(0, 8)
        );

        setTypes((typeResponse.data || []).map(processTypeData));
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.status === 403
            ? "Security Block: Forbidden"
            : "Connection Error: API Unreachable"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [processPropertyData, processTypeData]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-700 mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium tracking-wide">Loading...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl border border-red-200">
          <h1 className="text-3xl font-semibold text-red-700 mb-4 tracking-tight">
            Error Loading Site Data
          </h1>
          <p className="text-gray-700 mb-2 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-10">
        {/* ✅ HERO SECTION (fixed background + no clipping) */}
        <section className="relative w-full min-h-[540px] md:min-h-[600px] mb-16">
          {/* Background layer (clipped only here, NOT the whole section) */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
              alt="Real estate hero"
              fetchPriority="high"
              width="1920"
              height="1080"
              className="absolute inset-0 w-full h-full object-cover scale-[1.03]"
              loading="eager"
              decoding="sync"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/10"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full">
            <div className="h-full flex items-center">
              <div className="w-full px-5 md:px-12 py-12">
                <div className="max-w-6xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-black/5 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                    <p className="text-sm font-semibold text-gray-800">
                      Portail immobilier • Maroc
                    </p>
                  </div>

                  {/* Title */}
                  <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight max-w-3xl">
                    Trouvez une maison qui
                    <span className="block text-indigo-700">s’adapte parfaitement</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-4 text-base md:text-xl text-gray-700 max-w-2xl">
                    Découvrez des annonces vérifiées, filtrez rapidement, et trouvez le logement de vos rêves.
                  </p>

                  {/* Advanced search */}
                  <HeroSearch types={types} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="my-16 border-gray-100" />

        {/* Property Types */}
        {types.length > 0 && (
          <section className="py-10 mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                Browse by Property Type
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Apartments, villas, offices, land — pick what fits your needs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {types.slice(0, 4).map((t) => (
                <PropertyTypeTile key={t.id} type={t} />
              ))}
            </div>

            {types.length > 4 && (
              <div className="text-center mt-12">
                <Link
                  to="/property-types"
                  className="inline-flex items-center text-lg text-indigo-700 font-semibold hover:text-indigo-900 transition border-b border-indigo-700 pb-1"
                >
                  View All Types
                  <svg
                    className="ml-1 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </section>
        )}

        <hr className="my-16 border-gray-100" />

        {/* Featured Properties */}
        <section className="py-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10 tracking-tight text-center">
            Featured Properties
          </h2>

          <div className="mt-8 px-3 sm:px-0">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {properties.map((p) => (
                  <ProductCard key={p.id} product={p} isPublic={true} />
                ))}
              </div>
            </div>
          </div>

          {properties.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/properties"
                className="inline-flex items-center text-lg bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full transition hover:bg-indigo-700 shadow-xl"
              >
                See All Properties
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          )}
        </section>

        <hr className="my-16 border-gray-100" />

        <WhyChooseUsImmo />
      </main>

      <Footer />

      <WhatsAppButton />
    </div>

  );
}
