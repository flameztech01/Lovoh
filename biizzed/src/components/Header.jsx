// components/Header.jsx – Cross‑domain + Logo animation (logo NOT a link)
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// --- Domain constants ---
const MAIN_DOMAIN = "https://lovohcreate.com";
const SUBDOMAINS = {
  biizzed: "https://biizzed.lovohcreate.com",
  uduua: "https://uduua.lovohcreate.com",
  events: "https://eventroom.lovohcreate.com",
};

// Detect current subdomain
const getCurrentSubdomain = () => {
  const hostname = window.location.hostname;
  if (hostname.includes("biizzed")) return "biizzed";
  if (hostname.includes("uduua")) return "uduua";
  if (hostname.includes("eventroom")) return "events";
  return null; // main domain or localhost
};
const currentSub = getCurrentSubdomain();

// Helper: get URL for a main‑domain path (always absolute to MAIN_DOMAIN when on subdomain)
const getMainDomainUrl = (path) => `${MAIN_DOMAIN}${path}`;
const getSubdomainUrl = (brand) => SUBDOMAINS[brand] || MAIN_DOMAIN;

// Decide link href
const getLinkHref = (to) => {
  const mainPages = ["/", "/about", "/work", "/services", "/contact"];
  if (mainPages.includes(to)) {
    if (currentSub !== null) return getMainDomainUrl(to);
    return to;
  }
  if (to === "/biizzed") return getSubdomainUrl("biizzed");
  if (to === "/uduua") return getSubdomainUrl("uduua");
  if (to === "/events") return getSubdomainUrl("events");
  return to;
};

// Map subdomain to logo (used when on that subdomain)
const subdomainLogoMap = {
  events: '/eventroom.png',
  biizzed: '/biizzed.png',
  uduua: '/uduua.png',
};

// Get target logo based on subdomain and path (main domain)
const getTargetLogo = (pathname, sub) => {
  if (sub !== null) {
    // On a subdomain, show the corresponding brand logo
    return subdomainLogoMap[sub] || '/logo.png';
  }
  // On main domain: path‑based logo
  if (pathname.startsWith("/uduua")) return "/uduua.png";
  if (pathname.startsWith("/thefruiit")) return "/thefruiit-logo.png";
  if (pathname.startsWith("/biizzed")) return "/biizzed.png";
  if (pathname.startsWith("/events")) return "/eventroom.png";
  return "/logo.png";
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWhatWeDoOpen, setIsWhatWeDoOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("/logo.png");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const whatWeDoRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const navContainerRef = useRef(null);

  const whatWeDoLinks = [
    { name: "Our Works", path: "/work" },
    { name: "Services", path: "/services" },
  ];

  // Animate logo change based on path/subdomain
  useEffect(() => {
    const targetLogo = getTargetLogo(location.pathname, currentSub);
    if (targetLogo === currentLogo) return;

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setCurrentLogo(targetLogo);
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [location.pathname, currentLogo]);

  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsWhatWeDoOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNavigation = useCallback(
    (to) => {
      closeAllMenus();
      const href = getLinkHref(to);
      if (href.startsWith("http")) {
        window.location.href = href;
      } else {
        navigate(to);
        scrollToTop();
      }
    },
    [closeAllMenus, navigate, scrollToTop]
  );

  // Close menus on route change
  useEffect(() => {
    closeAllMenus();
  }, [location.pathname, closeAllMenus]);

  // Desktop: click outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768) return;
      if (whatWeDoRef.current && !whatWeDoRef.current.contains(event.target)) {
        setIsWhatWeDoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile: click outside closes everything
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target)) {
        closeAllMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isMenuOpen, closeAllMenus]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  // ESC key closes everything
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAllMenus();
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, closeAllMenus]);

  const toggleWhatWeDo = () => setIsWhatWeDoOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleMobileWhatWeDo = (e) => {
    e.stopPropagation();
    setIsWhatWeDoOpen((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-8 pt-4">
      <nav className="max-w-7xl mx-auto" ref={navContainerRef}>
        <div className="relative rounded-full bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_10px_35px_rgba(37,72,153,0.10)] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo – NO LONGER A LINK */}
            <div className="flex-shrink-0">
              <div className="flex items-center relative w-32 h-8 cursor-default">
                <img
                  src={currentLogo}
                  alt="Lovoh Create"
                  className={`absolute inset-0 h-8 w-auto object-contain transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                  onError={(e) => { e.target.src = "/logo.png"; }}
                />
              </div>
            </div>

            {/* Desktop Navigation (unchanged) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <button onClick={() => handleNavigation("/")} className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">
                Welcome
              </button>
              <button onClick={() => handleNavigation("/about")} className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">
                About
              </button>

              <div className="relative" ref={whatWeDoRef}>
                <button onClick={toggleWhatWeDo} className="flex items-center text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">
                  What we do
                  <svg className={`ml-1 w-4 h-4 transition-transform duration-200 ${isWhatWeDoOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isWhatWeDoOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.10)] border border-blue-100 py-3 z-50">
                    {whatWeDoLinks.map((item) => (
                      <button key={item.name} onClick={() => handleNavigation(item.path)} className="block w-full text-left mx-2 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all duration-200 font-medium text-gray-900">
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => handleNavigation("/biizzed")} className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">Biizzed</button>
              <button onClick={() => handleNavigation("/uduua")} className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">Uduua</button>
              <button onClick={() => handleNavigation("/events")} className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">EventRoom</button>
              <button onClick={() => handleNavigation("/contact")} className="ml-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]">
                Contact
              </button>
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
              <div ref={mobileMenuRef} className="absolute top-full left-0 right-0 mt-2 md:hidden z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1">
                    <button onClick={() => handleNavigation("/")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">Welcome</button>
                    <button onClick={() => handleNavigation("/about")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">About</button>
                    <div className="rounded-xl overflow-hidden">
                      <button onClick={toggleMobileWhatWeDo} className="flex items-center justify-between w-full text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">
                        <span>What we do</span>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isWhatWeDoOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isWhatWeDoOpen && (
                        <div className="mt-1 space-y-1 pl-4">
                          {whatWeDoLinks.map((item) => (
                            <button key={item.name} onClick={() => handleNavigation(item.path)} className="w-full text-left bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-all duration-200 border border-gray-100">
                              <div className="font-medium">{item.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleNavigation("/biizzed")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">Biizzed</button>
                    <button onClick={() => handleNavigation("/uduua")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">Uduua</button>
                    <button onClick={() => handleNavigation("/events")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">EventRoom</button>
                    <button onClick={() => handleNavigation("/contact")} className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 text-white px-4 py-3 rounded-xl text-base font-semibold text-center transition-all duration-200 mt-2 shadow-md hover:shadow-lg">Contact</button>
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