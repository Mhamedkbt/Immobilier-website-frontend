// AddProductForm.jsx (IMMO VERSION - STYLE IMPROVED)
// ✅ Logic unchanged
// ✅ Better “Disponibilité” select style like your old green/red select (dynamic style)
// ✅ Softer typography (no heavy bold everywhere), cleaner spacing, pro look

import React, { useEffect, useMemo, useRef, useState } from "react";
import API_URL from "../../config/api";

const BACKEND_URL = API_URL;
const DEFAULT_IMAGE = "/no-image.png";

// ------------------------- UI helpers (STYLE ONLY)
const labelClasses = "text-[12px] font-medium text-gray-600 mb-1";
const sectionTitle = "text-[13px] font-semibold text-gray-900";
const sectionSub = "text-xs text-gray-500";
const inputClasses =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm " +
  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition";
const selectClasses =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm " +
  "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition cursor-pointer";
const fileInputClasses =
  "w-full rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 " +
  "text-indigo-800 font-semibold cursor-pointer hover:bg-indigo-100 transition";

// ✅ old-style colored select (Disponible / Indisponible)
const availabilitySelect = (isAvailable) =>
  [
    "w-full rounded-2xl px-4 py-3 shadow-sm cursor-pointer transition border-2",
    "focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400",
    isAvailable
      ? "bg-emerald-50 border-emerald-400 text-emerald-900"
      : "bg-rose-50 border-rose-400 text-rose-900",
  ].join(" ");

// Hide scrollbar (cross-browser)
const noScrollbarStyle = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

// ------------------------- data helpers (UNCHANGED)
const toBool = (v, fallback = false) => {
  if (v === true || v === 1 || String(v).toLowerCase() === "true") return true;
  if (v === false || v === 0 || String(v).toLowerCase() === "false") return false;
  return fallback;
};

const cleanNum = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeImageToUrl = (img) => {
  if (!img) return null;

  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    const normalized = img.replace(/\\/g, "/");
    return normalized.startsWith("/")
      ? `${BACKEND_URL}${normalized}`
      : `${BACKEND_URL}/${normalized}`;
  }

  if (typeof img === "object") {
    const maybe = img.url || img.path || img.image || img.src;
    if (!maybe) return null;
    if (String(maybe).startsWith("http")) return String(maybe);
    const normalized = String(maybe).replace(/\\/g, "/");
    return normalized.startsWith("/")
      ? `${BACKEND_URL}${normalized}`
      : `${BACKEND_URL}/${normalized}`;
  }

  return null;
};

const uploadToImageKit = async (file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", "/immobilier/products");

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/uploads/image`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {}

  if (!res.ok) throw new Error(json?.message || text || "Upload failed");
  if (!json?.url) throw new Error("Upload ok but no url returned");

  return json.url;
};

export default function AddProductForm({ categories = [], product, onAdd, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // IMMO fields (UNCHANGED)
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("SALE");
  const [category, setCategory] = useState(categories?.[0]?.name || "");
  const [price, setPrice] = useState("");
  const [onPromotion, setOnPromotion] = useState(false);
  const [previousPrice, setPreviousPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [address, setAddress] = useState("");
  const [surfaceM2, setSurfaceM2] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  // cleanup blobs on unmount (UNCHANGED)
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      for (const img of imagesRef.current || []) {
        if (img?.url?.startsWith("blob:")) URL.revokeObjectURL(img.url);
      }
    };
  }, []);

  const hasCategories = useMemo(
    () => Array.isArray(categories) && categories.length > 0,
    [categories]
  );

  // sync when editing (UNCHANGED)
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPurpose((product.purpose || "SALE").toString().trim().toUpperCase());
      setCategory(product.category || categories?.[0]?.name || "");
      setPrice(product.price ?? "");
    //   setOnPromotion(toBool(product.onPromotion, false));
    //   setPreviousPrice(product.previousPrice ?? "");
      setIsAvailable(toBool(product.isAvailable, true));

      setAddress(product.address || "");
      setSurfaceM2(product.surfaceM2 ?? "");
      setBedrooms(product.bedrooms ?? "");
      setBathrooms(product.bathrooms ?? "");
      setDescription(product.description || "");

      const existingUrls = (product.images || [])
        .map(normalizeImageToUrl)
        .filter(Boolean);

      setImages(
        existingUrls.map((url) => ({ url, file: null, isExisting: true }))
      );
    } else {
      setName("");
      setPurpose("SALE");
      setCategory(categories?.[0]?.name || "");
      setPrice("");
      setOnPromotion(false);
      setPreviousPrice("");
      setIsAvailable(true);

      setAddress("");
      setSurfaceM2("");
      setBedrooms("");
      setBathrooms("");
      setDescription("");
      setImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, categories]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = files.slice(0, 20).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const target = prev[idx];
      if (target?.url?.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const setPrimaryImage = (idx) => {
    setImages((prev) => {
      if (idx <= 0) return prev;
      const copy = [...prev];
      const picked = copy.splice(idx, 1)[0];
      copy.unshift(picked);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) return alert("Nom: obligatoire");
    if (!purpose) return alert("Transaction: obligatoire");
    if (!category) return alert("Type de bien: obligatoire");
    if (cleanNum(price) == null) return alert("Prix: obligatoire");

    setIsSubmitting(true);

    try {
      const uploadedOrExisting = await Promise.all(
        images.map(async (img) => {
          if (img.isExisting) return img.url;
          if (img.file) return await uploadToImageKit(img.file);
          return null;
        })
      );

      const finalUrls = uploadedOrExisting.filter(Boolean);

      const payload = {
        name: name.trim(),
        category: category.trim(),
        price: cleanNum(price),
      
        // ✅ always send default to avoid null
        previousPrice: 0,
        onPromotion: false,
      
        purpose: String(purpose).trim().toUpperCase(),
        address: address?.trim() || "",
      
        surfaceM2: cleanNum(surfaceM2),
        bedrooms: cleanNum(bedrooms),
        bathrooms: cleanNum(bathrooms),
      
        isAvailable: Boolean(isAvailable),
      
        description: description || "",
        images: finalUrls,
      };
      

      await onAdd(payload);
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
      alert(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
              {product ? "Modifier l’annonce" : "Ajouter une annonce"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Remplis les infos puis clique <span className="font-medium">“Enregistrer”</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-red-600 font-semibold transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 md:px-8 py-6 space-y-6">
          {/* Section: Basic */}
          <div className="rounded-3xl border border-gray-100 bg-gray-50/40 p-4 md:p-5">
            <div className="mb-4">
              <div className={sectionTitle}>Informations</div>
              <div className={sectionSub}>Titre, type, transaction, disponibilité.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className={labelClasses}>Titre / Nom</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Appartement moderne à Casablanca"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <div className={labelClasses}>Type de bien</div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={selectClasses}
                  required
                >
                  {!hasCategories && <option value="">Aucune catégorie</option>}
                  {hasCategories &&
                    categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className={labelClasses}>Transaction</div>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={selectClasses}
                  required
                >
                  <option value="SALE">Acheter</option>
                  <option value="RENT">Louer</option>
                </select>
              </div>

              <div>
                <div className={labelClasses}>Disponibilité</div>
                <select
                  value={isAvailable ? "true" : "false"}
                  onChange={(e) => setIsAvailable(e.target.value === "true")}
                  className={availabilitySelect(isAvailable)} // ✅ dynamic green/red
                >
                  <option value="true">🟢 Disponible</option>
                  <option value="false">🔴 Indisponible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Pricing & Location */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm">
            <div className="mb-4">
              <div className={sectionTitle}>Prix & Localisation</div>
              <div className={sectionSub}>Prix, adresse.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className={labelClasses}>Prix (DH)</div>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 850000"
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClasses}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <div className={labelClasses}>Adresse</div>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Casablanca, Maarif…"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Section: Specs */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm">
            <div className="mb-4">
              <div className={sectionTitle}>Caractéristiques</div>
              <div className={sectionSub}>Surface, chambres, salles de bain.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className={labelClasses}>Surface (m²)</div>
                <input
                  value={surfaceM2}
                  onChange={(e) => setSurfaceM2(e.target.value)}
                  placeholder="Ex: 120"
                  type="number"
                  min="0"
                  step="1"
                  className={inputClasses}
                />
              </div>

              <div>
                <div className={labelClasses}>Chambres</div>
                <input
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="Ex: 3"
                  type="number"
                  min="0"
                  step="1"
                  className={inputClasses}
                />
              </div>

              <div>
                <div className={labelClasses}>Salles de bain</div>
                <input
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="Ex: 2"
                  type="number"
                  min="0"
                  step="1"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div className="rounded-3xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm">
            <div className="mb-3">
              <div className={sectionTitle}>Description</div>
              <div className={sectionSub}>Détails du bien.</div>
            </div>

            <div>
              <div className={labelClasses}>Texte</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décris le bien (quartier, étage, parking, etc.)"
                className={`${inputClasses} min-h-[140px] resize-y`}
                rows={5}
              />
            </div>
          </div>

          {/* Section: Images */}
          <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-4 md:p-5">
            <div className="mb-4">
              <div className={sectionTitle}>Images</div>
              <div className={sectionSub}>Clique une image pour la mettre en image principale.</div>
            </div>

            <div>
              <div className={labelClasses}>Ajouter des images</div>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className={fileInputClasses} />
            </div>

            {images.length > 0 && (
              <div className="mt-4">
                <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>

                <div className="hide-scrollbar flex gap-3 overflow-x-auto overflow-y-hidden pb-2" style={noScrollbarStyle}>
                  {images.map((img, idx) => {
                    const isPrimary = idx === 0;
                    return (
                      <button
                        type="button"
                        key={img.url + idx}
                        onClick={() => setPrimaryImage(idx)}
                        className={`relative w-28 h-20 md:w-32 md:h-24 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                          isPrimary
                            ? "border-indigo-600 ring-2 ring-indigo-200"
                            : "border-white/0 bg-white/40 ring-1 ring-gray-200 hover:ring-gray-300"
                        }`}
                        title={isPrimary ? "Image principale" : "Cliquer pour mettre en principale"}
                      >
                        {isPrimary && (
                          <span className="absolute top-2 left-2 z-10 rounded-full bg-indigo-600/95 text-white text-[11px] font-semibold px-2 py-1 shadow">
                            Principale
                          </span>
                        )}

                        <img
                          src={img.url || DEFAULT_IMAGE}
                          alt="preview"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                        />

                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/95 text-red-600 flex items-center justify-center font-semibold shadow hover:bg-white transition"
                          aria-label="Remove image"
                          title="Supprimer"
                        >
                          ✕
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 text-xs text-indigo-900/70">
                  {images.length} image{images.length > 1 ? "s" : ""} • La 1ère est l’image principale.
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-1 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-2xl px-4 py-3.5 font-semibold shadow-xl transition active:scale-[0.99] ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isSubmitting ? "Enregistrement..." : product ? "Enregistrer" : "Créer"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-3 rounded-2xl px-4 py-3.5 font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
