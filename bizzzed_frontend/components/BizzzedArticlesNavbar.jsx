// components/BizzzedArticlesNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaArrowLeft,
} from "react-icons/fa";

const BizzzedArticlesNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hiddenRows, setHiddenRows] = useState(false);

  // Sync search term with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get("search") || "";
    setSearchTerm(urlSearch);
  }, [location.search]);

  // Handle scroll behavior - hide/show secondary rows
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection("down");
        setHiddenRows(true);
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
        setHiddenRows(false);
      }

      setScrolled(currentScrollY > 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const value = searchTerm.trim();

    if (value) {
      navigate(`/biizzed/articles?search=${encodeURIComponent(value)}`);
    } else {
      navigate("/biizzed/articles");
    }

    setIsSearchOpen(false);
  };

  const handleCategoryClick = (category) => {
    navigate(`/biizzed/articles?category=${encodeURIComponent(category)}`);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleNavClick = (item) => {
    const lowerItem = item.toLowerCase();

    if (lowerItem === "home") {
      navigate("/biizzed");
    } else if (lowerItem === "all articles") {
      navigate("/biizzed/articles");
    } else if (
      [
        "business",
        "technology",
        "startups",
        "marketing",
        "finance",
        "lifestyle",
        "leadership",
        "innovation",
      ].includes(lowerItem)
    ) {
      handleCategoryClick(item);
    } else if (lowerItem === "featured") {
      navigate("/biizzed/articles?featured=true");
    } else if (lowerItem === "latest") {
      navigate("/biizzed/articles?sort=latest");
    } else if (lowerItem === "trending") {
      navigate("/biizzed/articles?sort=trending");
    } else if (lowerItem === "editors pick") {
      navigate("/biizzed/articles?editorsPick=true");
    } else if (lowerItem === "insights") {
      handleCategoryClick("Insights");
    } else if (lowerItem === "interviews") {
      handleCategoryClick("Interviews");
    } else if (lowerItem === "analysis") {
      handleCategoryClick("Analysis");
    } else {
      navigate("/biizzed/articles");
    }

    setIsMobileMenuOpen(false);
  };

  const topMiniItems = ["Subscribe", "Newsletter", "Advertise"];
  const mainNavItems = [
    "Home",
    "All Articles",
    "Business",
    "Technology",
    "Startups",
    "Marketing",
    "Finance",
    "Lifestyle",
  ];
  const subNavItems = [
    "Latest",
    "Trending",
    // "Editors Pick",
    // "Leadership",
    // "Innovation",
    // "Insights",
  ];
  const mobileMenuItems = [
    "Home",
    // "All Articles",
    // "Business",
    // "Technology",
    // "Startups",
    // "Marketing",
    // "Finance",
    // "Lifestyle",
    "Latest",
    "Trending",
    // "Editors Pick",
    // "Leadership",
    // "Innovation",
  ];

  const popularCategories = [
    "Business",
    "Technology",
    "Startups",
    "Leadership",
    "Finance",
    "Marketing",
    "Innovation",
  ];

  return (
    <>
      {/* Fixed Top Section - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* TOP BRAND COLOR STRIP */}
        <div className="hidden md:block bg-[#1B3766] text-white transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="h-9 flex items-center justify-between">
              <div className="flex items-center gap-5 text-[11px] uppercase tracking-wide font-medium">
                {topMiniItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaFacebookF />
                </button>
                <button
                  type="button"
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaTwitter />
                </button>
                <button
                  type="button"
                  className="hover:opacity-80 transition-opacity"
                >
                  <FaInstagram />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LOGO + BACK BUTTON ROW */}
        <div
          className={`bg-white transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="py-4 md:py-5 flex items-center justify-between gap-4">
              {/* Left - Back Button & Logo */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/biizzed")}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#1B3766] transition-colors group"
                  aria-label="Go back"
                >
                  <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Back
                  </span>
                </button>

                <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

                <Link
                  to="/biizzed/articles"
                  className="shrink-0 flex items-center gap-2 group"
                >
                  <img
                    src="/biizzed-logo.png"
                    alt="Bizzzed"
                    className="h-16 md:h-20 w-auto transition-transform group-hover:scale-105 duration-200"
                  />
                </Link>
              </div>

              {/* HEADER AD */}
              <div className="hidden md:flex flex-1 justify-end">
                <div className="w-full max-w-[520px] h-[72px] bg-[#2f2f2f] text-white flex items-center justify-center text-sm font-medium border border-gray-300">
                  Header Advertisement
                </div>
              </div>

              {/* MOBILE ACTIONS */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center text-gray-700"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-10 h-10 rounded-md bg-[#1B3766] text-white flex items-center justify-center"
                  aria-label="Open menu"
                >
                  <FaBars />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Scrolls under top section */}
      <div
        className={`fixed left-0 right-0 z-40 bg-white transition-transform duration-300 ease-in-out hidden md:block ${
          hiddenRows ? "-translate-y-full" : "translate-y-0"
        }`}
        style={{ top: "113px" }}
      >
        {/* MAIN NAV */}
        <div className="bg-[#1B3766] border-t border-[#142952] border-b border-[#142952]">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="h-11 flex items-center justify-between gap-4">
              <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
                {mainNavItems.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`px-4 h-11 text-[12px] font-semibold uppercase whitespace-nowrap transition-colors ${
                      index === 0
                        ? "bg-white text-[#1B3766]"
                        : "text-white hover:bg-[#142952]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="shrink-0 text-white/85 hover:text-white text-sm px-2"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* SUB NAV */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="h-9 flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
                {subNavItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className="text-[11px] uppercase text-gray-600 hover:text-[#1B3766] whitespace-nowrap font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-[11px] uppercase text-gray-400 hover:text-[#1B3766] font-medium"
                type="button"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* NEWS TICKER - Latest Articles Ticker */}
        <div className="bg-[#f7f7f7] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="h-10 flex items-center gap-3 overflow-hidden">
              <div className="bg-[#1B3766] text-white text-[11px] font-bold uppercase px-3 h-6 flex items-center shrink-0">
                Latest Articles
              </div>

              <div className="text-[12px] text-gray-600 truncate">
                <Link
                  to="/biizzed/articles/1"
                  className="hover:text-[#1B3766] transition-colors"
                >
                  The Future of AI in Business Strategy | Expert Insights &
                  Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPACER - Accounts for fixed header height */}
      <div className="h-[88px] md:h-[189px]"></div>

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideDown">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Search Bizzzed Articles
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Search articles, topics, and categories
                </p>
              </div>

              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="Close search"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, keyword or category..."
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
                  autoFocus
                />

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
                  Popular Topics
                </p>

                <div className="flex flex-wrap gap-2">
                  {popularCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-[#1B3766]/10 text-sm text-gray-700 hover:text-[#1B3766] transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[80] md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-[88%] max-w-[360px] bg-white shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* HEADER */}
          <div className="bg-[#1B3766] text-white px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/8copy.png" alt="Bizzzed" className="h-12 w-auto" />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-lg bg-[#1B3766] text-white flex items-center justify-center"
              >
                <FaSearch />
              </button>
            </form>
          </div>

          {/* MENU LIST */}
          <div className="overflow-y-auto h-[calc(100%-180px)] px-4 py-4">
            <div className="mb-3 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
              Browse Sections
            </div>

            <div className="space-y-2">
              {mobileMenuItems.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#1B3766]/5 hover:text-[#1B3766] text-gray-700 font-medium transition-all"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-3 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                Quick Access
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["Latest News", "Top Stories", "Featured", "Editors Pick"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className="px-3 py-3 rounded-xl bg-[#1B3766] text-white text-sm font-medium hover:bg-[#142952] transition-colors"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
            <div className="flex items-center justify-center gap-4 text-gray-500 mb-2">
              <button type="button" className="hover:text-[#1B3766]">
                <FaFacebookF />
              </button>
              <button type="button" className="hover:text-[#1B3766]">
                <FaTwitter />
              </button>
              <button type="button" className="hover:text-[#1B3766]">
                <FaInstagram />
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400">
              Premium business insights and articles
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.28s ease-out;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default BizzzedArticlesNavbar;
