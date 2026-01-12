import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const DEFAULT_IMAGE = "/placeholder.jpg";

const normalize = (v) => String(v || "").trim();

function categoryTone(category) {
  const c = normalize(category).toLowerCase();

  return "bg-gray-900/90 text-white";
}

function categoryIcon(category) {
  const c = normalize(category).toLowerCase();
  if (c.includes("appart")) return "fa-building";
  if (c.includes("terrain") || c.includes("land")) return "fa-mountain-sun";
  if (c.includes("villa") || c.includes("maison") || c.includes("house")) return "fa-house";
  if (c.includes("bureau") || c.includes("office")) return "fa-briefcase";
  return "fa-tag";
}

export default function ProductCard({ product, isPublic }) {
  const linkUrl = isPublic
    ? `/properties/${product.id}`
    : `/admin/product/edit/${product.id}`;

  const imageUrl = useMemo(() => {
    const img0 = product?.images?.[0];
    const raw = img0?.url || img0?.path || img0;
    return typeof raw === "string" && raw.trim() ? raw : DEFAULT_IMAGE;
  }, [product]);

  const isAvailable =
    product?.isAvailable === true ||
    String(product?.isAvailable).toLowerCase() === "true" ||
    product?.isAvailable === 1;

  const purpose = String(product?.purpose || "").trim().toUpperCase(); // RENT | SALE
  const purposeLabel =
    purpose === "RENT" ? "À LOUER" : purpose === "SALE" ? "À VENDRE" : "ANNONCE";

  const purposePill =
    purpose === "RENT"
      ? "bg-emerald-600 text-white"
      : purpose === "SALE"
      ? "bg-indigo-600 text-white"
      : "bg-gray-900 text-white";

  const price = Number(product?.price || 0);
  const priceLabel = `${price.toLocaleString("fr-MA")} DH`;

  const address = product?.address ? String(product.address).trim() : "";

  const category = normalize(product?.category) || "Bien";
  const categoryPill = categoryTone(category);
  const categoryIco = categoryIcon(category);

  const meta = useMemo(() => {
    const items = [];
    if (product?.bedrooms != null && product.bedrooms !== "")
      items.push({ icon: "fa-bed", text: `${product.bedrooms} ch` });
    if (product?.bathrooms != null && product.bathrooms !== "")
      items.push({ icon: "fa-bath", text: `${product.bathrooms} sdb` });
    if (product?.surfaceM2 != null && product.surfaceM2 !== "")
      items.push({ icon: "fa-ruler-combined", text: `${product.surfaceM2} m²` });
    return items.slice(0, 3);
  }, [product]);

  return (
    <Link
      to={linkUrl}
      className="group block rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-[16/10] lg:aspect-[16/9] bg-gray-100 overflow-hidden">
        <LazyLoadImage
          src={imageUrl}
          alt={product?.name || "Property"}
          effect="blur"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
        />

        {/* Pro overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-black/0" />

        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 pointer-events-none">
          {/* ✅ Mobile: purpose + category in ONE LINE
              ✅ Desktop: keep stacked (like before) */}
          <div className="flex flex-row flex-nowrap gap-2 md:flex-col">
            <span
              className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide px-4 py-2 rounded-full shadow ${purposePill}`}
            >
              {purposeLabel}
            </span>

            {/* Type de bien pill */}
            <span
              className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide px-4 py-2 rounded-full shadow ${categoryPill}`}
              style={{ width: "fit-content" }}
              title="Type de bien"
            >
              <i className={`fa-solid ${categoryIco}`} />
              {category}
            </span>
          </div>

          {/* Right */}
          {!isAvailable && (
            <span className="text-[11px] font-semibold tracking-wide px-4 py-2 rounded-full shadow bg-red-600 text-white">
              INDISPONIBLE
            </span>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="p-5">
        <h3 className="text-gray-900 font-semibold text-[18px] leading-snug line-clamp-2 group-hover:text-indigo-700 transition">
          {product?.name}
        </h3>

        {/* Address */}
        <div className="mt-2">
          {address ? (
            <p className="text-[14px] text-gray-600 line-clamp-1 flex items-center gap-2">
              <span className="text-gray-400">
                <i className="fa-solid fa-location-dot" />
              </span>
              {address}
            </p>
          ) : (
            <p className="text-[14px] text-gray-500">Voir les détails du bien</p>
          )}
        </div>

        {/* Meta */}
        {meta.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.map((m, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-4 py-2"
              >
                <i className={`fa-solid ${m.icon} text-gray-400`} />
                {m.text}
              </span>
            ))}
          </div>
        )}

        {/* Bottom */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[22px] font-semibold text-indigo-700 leading-none">
              {priceLabel}
            </div>
            <div className="mt-1 text-[13px] text-gray-500">
              {purpose === "RENT" ? "par mois" : purpose === "SALE" ? "prix total" : ""}
            </div>
          </div>

          <span
            className={`text-[13px] font-semibold px-4 py-2 rounded-full border ${
              isAvailable
                ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                : "border-red-200 text-red-700 bg-red-50"
            }`}
          >
            {isAvailable ? "Disponible" : "Non dispo"}
          </span>
        </div>
      </div>
    </Link>
  );
}
categoryTone