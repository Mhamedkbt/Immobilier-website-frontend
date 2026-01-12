import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Create a reference to the navbar to detect "outside" clicks
  const navRef = useRef(null);

  const toggleMenu = () => setIsOpen((s) => !s);

  // --- PRO LOGIC: AUTO-CLOSE MENU ---
  useEffect(() => {
    const handleClose = () => setIsOpen(false);

    const handleClickOutside = (event) => {
      // If the click is NOT on the navbar/menu, close it
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // 1. Close when user scrolls down
      window.addEventListener("scroll", handleClose);
      // 2. Close when user clicks anywhere on the "body"
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("scroll", handleClose);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // ✅ IMMO NAV LINKS (removed "Property Types")
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const linkClasses =
    "text-gray-700 hover:text-indigo-700 font-medium transition duration-300 tracking-wide block py-3 px-4 rounded-lg hover:bg-gray-50 lg:px-0 lg:hover:bg-transparent";

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    // Attached navRef here to detect clicks
    <header ref={navRef} className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center py-4">
          {/* ✅ IMMO BRAND */}
          <Link to="/" className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tighter">
            IMMO<span className="text-gray-900">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex flex-1 items-center justify-end space-x-10">
            <nav className="flex space-x-7">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative font-medium transition duration-300 tracking-wide ${
                    isActive(link.path) ? "text-indigo-700" : "text-gray-700 hover:text-indigo-700"
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute -bottom-2 left-0 right-0 mx-auto h-0.5 w-6 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* ✅ Admin login */}
            <Link
              to="/login"
              className="text-sm text-white bg-indigo-600 py-2.5 px-5 rounded-full hover:bg-indigo-700 transition shadow-sm font-semibold"
            >
              Login
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center lg:hidden">
            {/* HAMBURGER / X ICON TOGGLE */}
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-indigo-700 focus:outline-none transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  // "X" Icon
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  // Hamburger Icon
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`lg:hidden bg-white border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 md:px-8 py-6">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)} // Close when link clicked
                className={linkClasses}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center text-sm text-white bg-indigo-600 py-3 rounded-xl hover:bg-indigo-700 transition font-bold shadow-sm"
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
