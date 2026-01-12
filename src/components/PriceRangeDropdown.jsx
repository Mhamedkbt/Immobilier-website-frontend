import React, { useEffect, useMemo, useRef, useState } from "react";
import { Range, getTrackBackground } from "react-range";

function formatMAD(n) {
  if (n == null) return "";
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatCompactMAD(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export default function PriceRangeDropdown({
  value,
  onChange,
  min = 0,
  max = 40_000_000,
  step = 10_000,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const [vmin, vmax] = value;

  const display = useMemo(
    () => `${formatMAD(vmin)} - ${formatMAD(vmax)} DH`,
    [vmin, vmax]
  );

  // Close on outside click + ESC
  useEffect(() => {
    function onPointerDown(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Pill */}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition bg-white
          ${open ? "border-orange-400 ring-2 ring-orange-200" : "border-gray-200 hover:border-gray-300"}
        `}
      >
        <span className="font-semibold text-orange-500">{display}</span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* ✅ DROPDOWN — DROPS DOWN */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white shadow-2xl border border-gray-100 p-4 z-[9999]">
          <div className="flex items-center justify-between text-sm mb-4">
            <p className="text-gray-800">
              Min:{" "}
              <span className="text-orange-500 font-semibold">
                {formatCompactMAD(vmin)} DH
              </span>
            </p>
            <p className="text-gray-800">
              Max:{" "}
              <span className="text-orange-500 font-semibold">
                {formatCompactMAD(vmax)} DH
              </span>
            </p>
          </div>

          <Range
            values={value}
            step={step}
            min={min}
            max={max}
            onChange={onChange}
            renderTrack={({ props, children }) => (
              <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                className="h-10 flex w-full"
                style={props.style}
              >
                <div
                  ref={props.ref}
                  className="h-2 w-full rounded-full self-center"
                  style={{
                    background: getTrackBackground({
                      values: value,
                      colors: ["#E5E7EB", "#FB923C", "#E5E7EB"],
                      min,
                      max,
                    }),
                  }}
                >
                  {children}
                </div>
              </div>
            )}
            renderThumb={({ props, isDragged }) => (
              <div
                {...props}
                className={`h-6 w-6 rounded-full bg-orange-500 shadow-md outline-none ${
                  isDragged ? "ring-4 ring-orange-200" : ""
                }`}
              />
            )}
          />

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onChange([min, max])}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
