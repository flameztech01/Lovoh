// components/Header.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ==================== SUBDOMAIN DETECTION ====================
const hostname = window.location.hostname;

const getSubdomain = () => {
  if (hostname === 'uduua.lovohcreate.com') return 'uduua';
  if (hostname === 'biizzed.lovohcreate.com') return 'biizzed';
  if (hostname === 'eventroom.lovohcreate.com') return 'events';
  return 'main';
};

const currentSubdomain = getSubdomain();

// Helper: get full URL for cross-subdomain navigation
const getSubdomainUrl = (subdomain) => {
  if (subdomain === 'biizzed') return 'https://biizzed.lovohcreate.com';
  if (subdomain === 'uduua') return 'https://uduua.lovohcreate.com';
  if (subdomain === 'events') return 'https://eventroom.lovohcreate.com'; // fixed typo
  return 'https://lovohcreate.com';
};

// Helper: build correct link href based on current context
const buildLink = (path) => {
  // If we're on a subdomain, external links go to full domain
  if (currentSubdomain !== 'main') {
    // These are main-domain-only paths
    const mainOnlyPaths = ['/about', '/services', '/work', '/contact', '/thefruiit', '/puuls', '/createinstitute', '/start-project'];
    if (mainOnlyPaths.includes(path)) {
      return `https://lovohcreate.com${path}`;
    }
    
    // Switching to another subdomain
    if (path === '/biizzed') return getSubdomainUrl('biizzed');
    if (path === '/uduua') return getSubdomainUrl('uduua');
    if (path === '/events') return getSubdomainUrl('events');
  }
  
  // On main domain, use relative paths as before
  return path;
};

// Helper: check if a link is external (needs full page navigation)
const isExternalLink = (href) => href.startsWith('http');

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWhatWeDoOpen, setIsWhatWeDoOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const whatWeDoRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const navContainerRef = useRef(null);

  // Logo state and animation
  const [currentLogo, setCurrentLogo] = useState("/logo.png");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const whatWeDoLinks = [
    { name: "Our Works", path: "/work" },
    { name: "Services", path: "/services" },
  ];

  // Map subdomain to logo (used only when on that subdomain)
  const subdomainLogoMap = {
    events: '/eventroom.png',
    biizzed: '/biizzed.png',
    uduua: '/uduua.png',
  };

  // Determine target logo based on subdomain and path
  const getTargetLogo = useCallback((pathname, subdomain) => {
    // If on a subdomain, always show the corresponding logo
    if (subdomain !== 'main') {
      return subdomainLogoMap[subdomain] || '/logo.png';
    }
    // Main domain: path-based logo
    if (pathname.startsWith("/uduua")) return "/uduua.png";
    if (pathname.startsWith("/thefruiit")) return "/thefruiit-logo.png";
    if (pathname.startsWith("/biizzed")) return "/biizzed.png";
    if (pathname.startsWith("/events")) return "/eventroom.png";
    return "/logo.png";
  }, []);

  // Animate logo change
  useEffect(() => {
    const targetLogo = getTargetLogo(location.pathname, currentSubdomain);
    if (targetLogo === currentLogo) return;

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setCurrentLogo(targetLogo);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, currentLogo, getTargetLogo]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
    setIsWhatWeDoOpen(false);
  }, []);

  const handleLinkClick = useCallback((path) => {
    closeAllMenus();
    const href = buildLink(path);
    
    if (isExternalLink(href)) {
      window.location.href = href;
    } else {
      navigate(path);
    }
    scrollToTop();
  }, [closeAllMenus, navigate, scrollToTop]);

  // Close menus when route changes
  useEffect(() => {
    closeAllMenus();
  }, [location.pathname, closeAllMenus]);

  // DESKTOP: Click outside to close dropdown only
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768) return;
      const isWhatWeDoClick = whatWeDoRef.current?.contains(event.target);
      if (!isWhatWeDoClick) setIsWhatWeDoOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // MOBILE: Click outside to close EVERYTHING
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      const isInsideNav = navContainerRef.current?.contains(event.target);
      if (!isInsideNav) {
        closeAllMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isMenuOpen, closeAllMenus]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ESC key to close everything
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

  const toggleWhatWeDo = useCallback(() => {
    setIsWhatWeDoOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      if (!prev) {
        setIsWhatWeDoOpen(false);
      }
      return !prev;
    });
  }, []);

  const toggleMobileWhatWeDo = useCallback((e) => {
    e.stopPropagation();
    setIsWhatWeDoOpen(prev => !prev);
  }, []);

  // Helper to render a nav link that works across subdomains
  const NavLink = ({ to, children, className, isButton = false }) => {
    const href = buildLink(to);
    const external = isExternalLink(href);
    
    if (external) {
      return (
        <a 
          href={href} 
          className={className}
          onClick={() => { closeAllMenus(); scrollToTop(); }}
        >
          {children}
        </a>
      );
    }
    
    if (isButton) {
      return (
        <Link to={href} onClick={() => { closeAllMenus(); scrollToTop(); }} className={className}>
          {children}
        </Link>
      );
    }
    
    return (
      <Link to={href} onClick={scrollToTop} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-8 pt-4">
      <nav className="max-w-7xl mx-auto" ref={navContainerRef}>
        <div className="relative rounded-full bg-white/95 backdrop-blur-md border border-blue-100 shadow-[0_10px_35px_rgba(37,72,153,0.10)] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with crossfade animation */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center relative w-32 h-8" onClick={scrollToTop}>
                <img
                  src={currentLogo}
                  alt="Lovoh Create"
                  className={`absolute inset-0 h-8 w-auto object-contain transition-opacity duration-300 ${
                    isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <NavLink to="/" className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">
                Welcome
              </NavLink>
              <NavLink to="/about" className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">
                About
              </NavLink>

              {/* What We Do Dropdown */}
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
                      <NavLink 
                        key={item.name} 
                        to={item.path} 
                        className="block mx-2 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-all duration-200 font-medium text-gray-900"
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <NavLink to="/biizzed" className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">Biizzed</NavLink>
              <NavLink to="/uduua" className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">Uduua</NavLink>
              <NavLink to="/events" className="text-gray-700 hover:text-blue-700 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-blue-50">EventRoom</NavLink>
              <NavLink to="/contact" isButton className="ml-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02]">
                Contact
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
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

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={closeAllMenus}
              />
              
              <div 
                ref={mobileMenuRef}
                className="absolute top-full left-0 right-0 mt-2 md:hidden z-50 animate-in slide-in-from-top-2 duration-200"
              >
                <div className="bg-white rounded-2xl border border-blue-100 shadow-xl p-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1">
                    <button onClick={() => handleLinkClick("/")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">
                      Welcome
                    </button>
                    <button onClick={() => handleLinkClick("/about")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">
                      About
                    </button>

                    {/* Mobile What We Do Accordion */}
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
                            <button key={item.name} onClick={() => handleLinkClick(item.path)} className="w-full text-left bg-gray-50 hover:bg-blue-50 px-4 py-3 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-all duration-200 border border-gray-100">
                              <div className="font-medium">{item.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleLinkClick("/biizzed")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">
                      Biizzed
                    </button>
                    <button onClick={() => handleLinkClick("/uduua")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">
                      Uduua
                    </button>
                    <button onClick={() => handleLinkClick("/events")} className="w-full text-left text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200">
                      EventRoom
                    </button>
                    <button onClick={() => handleLinkClick("/contact")} className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 text-white px-4 py-3 rounded-xl text-base font-semibold text-center transition-all duration-200 mt-2 shadow-md hover:shadow-lg">
                      Contact
                    </button>
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