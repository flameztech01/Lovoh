// components/AllEventsNavbar.jsx – Added brands grid dropdown
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';

// --- Domain constants (cross‑domain navigation) ---
const MAIN_DOMAIN = "https://lovohcreate.com";
const SUBDOMAINS = {
  biizzed: "https://biizzed.lovohcreate.com",
  uduua: "https://uduua.lovohcreate.com",
  events: "https://eventroom.lovohcreate.com",
};

// Sub‑brands data (including main brand for quick access)
const BRANDS = [
  { id: "biizzed", name: "Biizzed", path: "/", icon: "/biizzed.png" },
  { id: "uduua", name: "Uduua", path: "/uduua", icon: "/uduua.png" },
  { id: "events", name: "EventRoom", path: "/", icon: "/eventroom.png" },
  { id: "lovoh", name: "Lovoh Create", path: "/", icon: "/logo.png", isMain: true },
];

// Detect current subdomain
const getCurrentSubdomain = () => {
  const hostname = window.location.hostname;
  if (hostname.includes("biizzed")) return "biizzed";
  if (hostname.includes("uduua")) return "uduua";
  if (hostname.includes("eventroom")) return "events";
  return null;
};
const currentSub = getCurrentSubdomain();

// Helper: get URL for a main‑domain path (absolute when on subdomain)
const getMainDomainUrl = (path) => `${MAIN_DOMAIN}${path}`;
const getSubdomainUrl = (brand) => SUBDOMAINS[brand] || MAIN_DOMAIN;

// Decide link href for cross‑domain navigation
const getLinkHref = (to, brandId) => {
  if (brandId && SUBDOMAINS[brandId]) {
    return getSubdomainUrl(brandId);
  }
  const mainPages = ["/", "/about", "/work", "/services", "/contact"];
  if (mainPages.includes(to)) {
    if (currentSub !== null) return getMainDomainUrl(to);
    return to;
  }
  return to;
};

// Grid icon (3x3 dots)
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

const AllEventsNavbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const brandsRef = useRef(null);
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Brand navigation (cross‑domain)
  const handleBrandClick = (brandId, path) => {
    setIsBrandsOpen(false);
    const href = getLinkHref(path, brandId);
    if (href.startsWith("http")) {
      window.location.href = href;
    } else {
      navigate(href);
    }
  };

  // Close brands dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandsRef.current && !brandsRef.current.contains(event.target)) {
        setIsBrandsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close brands dropdown on route change
  useEffect(() => {
    setIsBrandsOpen(false);
  }, [navigate]); // close when navigation occurs

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!searchOpen ? (
          // Normal Navbar
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left - Back → Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleBack}
                className="p-2 text-gray-500 hover:text-[#1B3766] hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              <Link to="/" className="flex-shrink-0">
                <img
                  src="/eventroom.png"
                  alt="EventRoom"
                  className="h-7 sm:h-8 w-auto"
                />
              </Link>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-1.5">
              {/* Brands Grid Button */}
              <div className="relative" ref={brandsRef}>
                <button
                  onClick={() => setIsBrandsOpen((prev) => !prev)}
                  className="p-2 text-gray-500 hover:text-[#1B3766] hover:bg-gray-50 rounded-lg transition-colors"
                  aria-label="All brands"
                >
                  <GridIcon />
                </button>
                {isBrandsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                    <div className="grid grid-cols-3 gap-3">
                      {BRANDS.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandClick(brand.id === "lovoh" ? null : brand.id, brand.path)}
                          className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-[#1B3766]/5 transition-all duration-200"
                        >
                          <img
                            src={brand.icon}
                            alt={brand.name}
                            className="w-10 h-10 object-contain mb-1"
                            onError={(e) => { e.target.src = "/logo.png"; }}
                          />
                          <span className="text-xs font-medium text-gray-700">{brand.name}</span>
                          {brand.isMain && (
                            <span className="text-[8px] text-gray-400 uppercase tracking-wider">Main</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 sm:p-2.5 text-gray-500 hover:text-[#1B3766] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FaSearch className="text-sm sm:text-base" />
              </button>

              {/* Create Event CTA */}
              <Link
                to="/dashboard/events/new"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1B3766] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#142952] transition-all"
              >
                <FaCalendarAlt className="text-[10px] sm:text-xs" />
                <span className="hidden sm:inline">Create Event</span>
                <span className="sm:hidden">Create</span>
              </Link>
            </div>
          </div>
        ) : (
          // Search Mode - Full width
          <div className="flex items-center gap-3 h-14 sm:h-16 animate-slideDown">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events, categories, locations..."
                className="w-full pl-9 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm sm:text-base bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent transition-all"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xs sm:text-sm" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchTerm('');
              }}
              className="text-sm text-gray-500 hover:text-[#1B3766] font-medium flex-shrink-0"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default AllEventsNavbar;