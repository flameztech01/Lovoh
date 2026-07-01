// components/Header.jsx – Uduua header (Home, Brands, Catalogue, Why Choose Uduua, Contact)
import React, { useEffect, useRef, useState, useCallback } from "react";

const OTHER_BRANDS = [
  { id: "lovohcreate", name: "Lovoh Create", path: "https://lovohcreate.com", icon: "/logo.png" },
  { id: "biizzed", name: "Biizzed", path: "https://biizzed.lovohcreate.com", icon: "/biizzed.png" },
  { id: "events", name: "EventRoom", path: "https://eventroom.lovohcreate.com", icon: "/eventroom.png" },
];

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "Brands", id: "brands" },
  { label: "Catalogue", id: "catalogue" },
  { label: "Why Choose Uduua", id: "why-uduua" },
  { label: "Contact", id: "contact" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubBrandsOpen, setIsSubBrandsOpen] = useState(false);

  const subBrandsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const navContainerRef = useRef(null);

  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsSubBrandsOpen(false);
  }, []);

  const scrollToSection = useCallback((id) => {
    closeAllMenus();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [closeAllMenus]);

  const toggleSubBrands = () => setIsSubBrandsOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMenuOpen((prev) => !prev);

  // Click outside for desktop
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth < 768) return;
      if (subBrandsRef.current && !subBrandsRef.current.contains(e.target))
        setIsSubBrandsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click outside for mobile
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target))
        closeAllMenus();
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isMenuOpen, closeAllMenus]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  // ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAllMenus();
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, closeAllMenus]);

  const GridIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="4" cy="4" r="2" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="20" cy="4" r="2" />
      <circle cx="4" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="20" cy="12" r="2" />
      <circle cx="4" cy="20" r="2" />
      <circle cx="12" cy="20" r="2" />
      <circle cx="20" cy="20" r="2" />
    </svg>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-8 pt-4">
      <nav className="max-w-7xl mx-auto" ref={navContainerRef}>
        <div className="relative rounded-full bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_10px_35px_rgba(37,72,153,0.10)] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-8">
                <img
                  src="/uduua.png"
                  alt="Uduua"
                  className="h-8 w-auto object-contain"
                  onError={(e) => { e.target.src = "/logo.png"; }}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50"
                >
                  {item.label}
                </button>
              ))}

              {/* Sub‑brands grid */}
              <div className="relative" ref={subBrandsRef}>
                <button
                  onClick={toggleSubBrands}
                  className="flex items-center justify-center text-gray-700 hover:text-blue-700 p-2 rounded-full transition-all duration-200 hover:bg-blue-50"
                  aria-label="Other Brands"
                >
                  <GridIcon />
                </button>
                {isSubBrandsOpen && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.10)] border border-blue-100 p-3 z-50">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2 px-1">
                      Other Brands
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {OTHER_BRANDS.map((brand) => (
                        <a
                          key={brand.id}
                          href={brand.path}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-blue-50 transition-all duration-200"
                        >
                          <img
                            src={brand.icon}
                            alt={brand.name}
                            className="w-10 h-10 object-contain mb-1"
                            onError={(e) => { e.target.src = "/logo.png"; }}
                          />
                          <span className="text-xs font-medium text-gray-700">{brand.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                ref={mobileMenuButtonRef}
                onClick={toggleMobileMenu}
                className="relative z-50 inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none transition-all duration-200"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {!isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeAllMenus} />
              <div
                ref={mobileMenuRef}
                className="absolute top-full left-0 right-0 mt-2 md:hidden z-50 animate-in slide-in-from-top-2 duration-200"
              >
                <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
                      >
                        {item.label}
                      </button>
                    ))}

                    {/* Mobile sub‑brands */}
                    <div className="pt-2 pb-1">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-4 mb-2">
                        Other Brands
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {OTHER_BRANDS.map((brand) => (
                          <a
                            key={brand.id}
                            href={brand.path}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all duration-200"
                          >
                            <img
                              src={brand.icon}
                              alt={brand.name}
                              className="w-8 h-8 object-contain mb-1"
                              onError={(e) => { e.target.src = "/logo.png"; }}
                            />
                            <span className="text-xs font-medium text-gray-700">{brand.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;