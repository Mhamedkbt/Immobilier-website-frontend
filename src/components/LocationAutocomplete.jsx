import React, { useEffect, useMemo, useRef, useState } from "react";
import { MOROCCO_PLACES } from "../data/moroccoPlaces";

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Ville ou quartier",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const rootRef = useRef(null);

  useEffect(() => setQuery(value || ""), [value]);

  // close on outside click + ESC
  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOROCCO_PLACES.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  return (
    <div ref={rootRef} className="relative w-full">
      {/* Input */}
      <div className="h-[52px] flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 shadow-sm">
        <span className="text-gray-400">
          <i className="fa-solid fa-location-dot" />
        </span>
        <input
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onChange(v);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[9999]">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden">
            <div className="max-h-72 overflow-auto">
              {results.map((p) => (
                <button
                  key={`${p.name}-${p.region}`}
                  type="button"
                  onClick={() => {
                    setQuery(p.name);
                    onChange(p.name);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <span className="text-gray-500 text-sm">({p.region})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
