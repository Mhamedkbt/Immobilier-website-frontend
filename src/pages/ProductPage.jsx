import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getProducts } from "../api/productsApi.js";
import ProductCard from "../components/ProductCard.jsx";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import API_URL from "../config/api";
import WhatsAppButton from "../components/WhatsAppButton.jsx";

// =========================================================================
// CONFIG
// =========================================================================
const BACKEND_URL = API_URL;
const DEFAULT_IMAGE = "/placeholder.jpg";

// =========================================================================
// HELPERS
// =========================================================================
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (String(path).startsWith("http")) return path;
  const normalizedPath = String(path).replace(/\\/g, "/");
  return normalizedPath.startsWith("/")
    ? `${BACKEND_URL}${normalizedPath}`
    : `${BACKEND_URL}/${normalizedPath}`;
};

const parseBoolean = (value) => {
  if (value === false || value === 0 || String(value).toLowerCase() === "false" || value == null) return false;
  return true;
};

const nfmt = (n) => {
  if (n == null || n === "") return null;
  const x = Number(n);
  if (Number.isNaN(x)) return null;
  return new Intl.NumberFormat("fr-FR").format(x);
};

const firstNonEmpty = (...vals) => vals.find((v) => v != null && String(v).trim() !== "");

// =========================================================================
// ICONS (inline SVG)
// =========================================================================
const Icon = ({ children }) => (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
    {children}
  </span>
);

const BedIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7h18v10H3z" />
    <path d="M3 17v3M21 17v3" />
    <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
  </svg>
);

const BathIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-4z" />
    <path d="M7 12V7a2 2 0 0 1 2-2h1" />
    <path d="M19 12v-1a2 2 0 0 0-2-2h-1" />
  </svg>
);

const RulerIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 20L20 3l1 1L4 21H3v-1z" />
    <path d="M7 17l2 2M10 14l2 2M13 11l2 2M16 8l2 2" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const TagIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10l-8 8-10-10V2h6l12 12z" />
    <path d="M7 7h.01" />
  </svg>
);

// =========================================================================
// IMAGE GALLERY (REAL FIX)
// =========================================================================
const ProductImageGallery = ({ images, initialActiveUrl, onActiveUrlChange, title }) => {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter((x) => x?.url) : []),
    [images]
  );

  const [index, setIndex] = useState(0);

  // ✅ Initialize once when images arrive (and try to match initialActiveUrl)
  useEffect(() => {
    if (!safeImages.length) return;

    let start = 0;
    if (initialActiveUrl) {
      const found = safeImages.findIndex((x) => x.url === initialActiveUrl);
      if (found >= 0) start = found;
    }

    setIndex(start);
    onActiveUrlChange?.(safeImages[start]?.url || DEFAULT_IMAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeImages.length]);

  // ✅ helpers
  const clampIndex = useCallback(
    (n) => {
      const len = safeImages.length;
      if (!len) return 0;
      return ((n % len) + len) % len;
    },
    [safeImages.length]
  );

  const goTo = useCallback(
    (nextIdx) => {
      if (!safeImages.length) return;
      const fixed = clampIndex(nextIdx);
      setIndex(fixed);
      onActiveUrlChange?.(safeImages[fixed]?.url || DEFAULT_IMAGE);
    },
    [safeImages, clampIndex, onActiveUrlChange]
  );

  // ✅ Next/Prev MUST use functional update (no stale closure)
  const prev = useCallback(() => {
    setIndex((cur) => {
      const next = clampIndex(cur - 1);
      onActiveUrlChange?.(safeImages[next]?.url || DEFAULT_IMAGE);
      return next;
    });
  }, [clampIndex, onActiveUrlChange, safeImages]);

  const next = useCallback(() => {
    setIndex((cur) => {
      const nxt = clampIndex(cur + 1);
      onActiveUrlChange?.(safeImages[nxt]?.url || DEFAULT_IMAGE);
      return nxt;
    });
  }, [clampIndex, onActiveUrlChange, safeImages]);

  // ✅ Keyboard arrows
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!safeImages.length) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev, safeImages.length]);

  if (!safeImages.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="h-[380px] md:h-[520px] bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 font-semibold">No images</span>
        </div>
      </div>
    );
  }

  const main = safeImages[index]?.url || DEFAULT_IMAGE;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* MAIN IMAGE */}
      <div className="relative h-[380px] md:h-[520px] lg:h-[560px] bg-gray-100 group overflow-hidden">
        <img
          src={main}
          alt={title || "Property image"}
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/10" />

        <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 text-white px-3 py-1 text-xs font-bold backdrop-blur">
          {index + 1}/{safeImages.length}
        </div>

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white text-gray-900 p-2.5 shadow-lg transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white text-gray-900 p-2.5 shadow-lg transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS */}
      {safeImages.length > 1 && (
        <div className="p-4">
          <div className="no-scrollbar flex gap-3 overflow-x-auto overflow-y-hidden pb-1">
            {safeImages.map((img, i) => {
              const active = i === index;
              return (
                <button
                  type="button"
                  key={`${img.url}-${i}`}
                  onClick={() => goTo(i)}
                  className={`relative flex-shrink-0 h-20 w-28 rounded-xl overflow-hidden border transition ${
                    active ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200 hover:border-gray-300"
                  }`}
                  aria-label={`Open image ${i + 1}`}
                >
                  <LazyLoadImage
                    src={img.url}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    wrapperClassName="w-full h-full"
                    effect="blur"
                    onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                  />
                  {active && <div className="absolute inset-0 ring-2 ring-inset ring-indigo-500/40" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// PAGE
// =========================================================================
export default function ProductPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const processProductData = useCallback((p) => {
    const normalizeImageObject = (img) => {
      const imagePath = img?.path || img;
      if (!imagePath) return null;
      return { url: getFullImageUrl(imagePath), blurHash: img?.blurHash || null };
    };

    return {
      ...p,
      images: (p.images || []).map(normalizeImageObject).filter((x) => x?.url),
      isAvailable: parseBoolean(p.isAvailable),
      onPromotion: parseBoolean(p.onPromotion),
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        const processed = (response.data || []).map(processProductData);
        setAllProducts(processed);

        const found = processed.find((x) => String(x.id) === String(id));
        if (!found) {
          setError("Annonce introuvable.");
          setProduct(null);
          return;
        }

        setProduct(found);
        setActiveImage(found.images?.[0]?.url || DEFAULT_IMAGE);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Failed to load product data:", err);
        setError("Erreur de chargement. Vérifiez la connexion à l’API.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, processProductData]);

  const relatedProducts = useMemo(() => {
    if (!product || !product.category || allProducts.length === 0) return [];
    return allProducts
      .filter(
        (p) =>
          p.category?.toLowerCase().trim() === product.category?.toLowerCase().trim() &&
          String(p.id) !== String(product.id) &&
          p.isAvailable
      )
      .slice(0, 4);
  }, [product, allProducts]);

  const title = firstNonEmpty(product?.title, product?.name, "Annonce");
  const category = firstNonEmpty(product?.category, product?.type, "Bien immobilier");
  const city = firstNonEmpty(product?.city, product?.address, product?.location);
  const price = firstNonEmpty(product?.price, product?.currentPrice);

  const surface = firstNonEmpty(product?.surfaceM2, product?.surface, product?.area, product?.size);
  const bedrooms = firstNonEmpty(product?.bedrooms, product?.rooms, product?.chambres);
  const bathrooms = firstNonEmpty(product?.bathrooms, product?.baths, product?.sallesDeBain);
  const description = firstNonEmpty(product?.description, product?.details);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center border border-gray-200">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-700 max-w-md">{error}</p>
            <Link to="/properties" className="mt-6 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
              Retour aux annonces
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 lg:py-12">
        <div className="mb-6">
          <Link to="/properties" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour aux annonces
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
              <TagIcon />
              <span>{category}</span>
            </span>

            {city && (
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                <PinIcon />
                <span className="truncate max-w-[240px]">{city}</span>
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {price != null && (
              <div className="text-2xl md:text-3xl font-extrabold text-green-700">
                {nfmt(price)} <span className="text-base font-bold text-green-700">DH</span>
              </div>
            )}

            {!product.isAvailable && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full">
                Indisponible
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <ProductImageGallery
              images={product.images}
              initialActiveUrl={activeImage}
              onActiveUrlChange={setActiveImage}
              title={title}
            />
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 md:p-6">
              <h2 className="text-lg font-extrabold text-gray-900">Caractéristiques</h2>
              <p className="text-sm text-gray-600 mt-1">Infos principales du bien.</p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 sm:col-span-2 bg-gray-50/40">
                  <Icon><RulerIcon /></Icon>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500">Surface</p>
                    <p className="text-lg font-extrabold text-gray-900">{surface != null ? `${nfmt(surface)} m²` : "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 bg-gray-50/40">
                  <Icon><BedIcon /></Icon>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500">Chambres</p>
                    <p className="text-lg font-extrabold text-gray-900">{bedrooms ?? "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 bg-gray-50/40">
                  <Icon><BathIcon /></Icon>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500">Salles de bain</p>
                    <p className="text-lg font-extrabold text-gray-900">{bathrooms ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <Link
                  to="/properties"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-800 hover:bg-gray-50"
                >
                  ← Retour aux annonces
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Description</h2>
          {description ? (
            <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ unicodeBidi: "plaintext", textAlign: "start" }} dir="auto">
              {description}
            </p>
          ) : (
            <p className="mt-4 text-gray-500 italic">Aucune description disponible pour cette annonce.</p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Annonces similaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} isPublic={true} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
