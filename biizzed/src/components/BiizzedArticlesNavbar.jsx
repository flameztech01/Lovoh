// components/BiizzedArticlesNavbar.jsx – Added brands grid dropdown
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaHome,
  FaNewspaper,
  FaBookOpen,
  FaVideo,
  FaSignInAlt,
  FaUserPlus,
  FaPlus,
  FaUserEdit,
  FaArrowRight,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useGetNotificationsQuery } from "../slices/notificationApiSlice";
import { useGetContributorStatusQuery } from "../slices/contributorApiSlice";
import { useLazyQuickSearchQuery } from "../slices/searchApiSlice";
import { debounce } from "lodash";

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
  { id: "events", name: "EventRoom", path: "/events", icon: "/eventroom.png" },
  { id: "lovoh", name: "Lovoh Create", path: "/", icon: "/logo.png", isMain: true },
];

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

// Decide link href for cross‑domain navigation
const getLinkHref = (to, brandId) => {
  // If it's a sub‑brand, use its subdomain
  if (brandId && SUBDOMAINS[brandId]) {
    return getSubdomainUrl(brandId);
  }
  // For main domain pages, use absolute URL if on subdomain
  const mainPages = ["/", "/about", "/work", "/services", "/contact"];
  if (mainPages.includes(to)) {
    if (currentSub !== null) return getMainDomainUrl(to);
    return to;
  }
  // Fallback
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

const BiizzedArticlesNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributorPrompt, setShowContributorPrompt] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  const brandsRef = useRef(null);

  // Fetch unread notification count (only if logged in)
  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, limit: 1 },
    { skip: !userInfo }
  );
  const unreadCount = notifData?.unreadCount || 0;

  // Fetch contributor status (skip if not logged in)
  const { data: contribData, isLoading: contribLoading } = useGetContributorStatusQuery(undefined, {
    skip: !userInfo?._id,
  });

  // Determine contributor status
  const isContributor = contribData?.data?.biizzed_contributor === true;
  const applicationStatus = contribData?.data?.contributor_application?.status || "not_applied";
  const isPending = applicationStatus === "pending";
  const isApproved = isContributor;
  const isRejected = applicationStatus === "rejected";
  const hasNotApplied = applicationStatus === "not_applied";

  // Quick search hook
  const [triggerQuickSearch] = useLazyQuickSearchQuery();

  // Debounced search for suggestions
  const debouncedSearch = React.useCallback(
    debounce(async (term) => {
      if (term.length >= 2) {
        setIsSearchingSuggestions(true);
        try {
          const result = await triggerQuickSearch({ q: term, limit: 8 }).unwrap();
          setSearchSuggestions(result.suggestions || []);
        } catch (error) {
          console.error("Search suggestions error:", error);
          setSearchSuggestions([]);
        } finally {
          setIsSearchingSuggestions(false);
        }
      } else {
        setSearchSuggestions([]);
      }
    }, 300),
    [triggerQuickSearch]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/magazines")) setActiveTab("magazines");
    else if (path.includes("/articles")) setActiveTab("articles");
    else if (path.includes("/videos")) setActiveTab("videos");
    else setActiveTab("feed");
  }, [location.pathname]);

  useEffect(() => {
    if (showSearch && searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSearchSuggestions([]);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, showSearch, debouncedSearch]);

  // Close brands dropdown on outside click (desktop)
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
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm("");
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSearch(false);
    setSearchTerm("");
    setSearchSuggestions([]);
    navigate(suggestion.url);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "feed":
        navigate("/feed");
        break;
      case "articles":
        navigate("/articles");
        break;
      case "magazines":
        navigate("/magazines");
        break;
      case "videos":
        navigate("/videos");
        break;
      default:
        navigate("/");
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

  // Open create modal based on contributor status
  const handleCreateButtonClick = () => {
    if (!userInfo) {
      navigate("/login?redirect=/feed");
      return;
    }

    if (contribLoading) {
      // Optionally show toast
      return;
    }

    if (isApproved) {
      setShowCreateModal(true);
      return;
    }

    setShowContributorPrompt(true);
  };

  const handleCreateOption = (type) => {
    setShowCreateModal(false);
    navigate(`/create-${type}`);
  };

  const createOptions = [
    {
      id: "article",
      label: "Article",
      icon: FaNewspaper,
      desc: "Write and publish an article",
      color: "bg-blue-500",
    },
    {
      id: "magazine",
      label: "Magazine",
      icon: FaBookOpen,
      desc: "Upload a PDF magazine",
      color: "bg-purple-500",
    },
    {
      id: "video",
      label: "Video",
      icon: FaVideo,
      desc: "Upload a video up to 30 min",
      color: "bg-red-500",
    },
  ];

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "article": return <FaNewspaper className="text-blue-500" />;
      case "magazine": return <FaBookOpen className="text-purple-500" />;
      case "video": return <FaVideo className="text-red-500" />;
      case "user": return <FaUserCircle className="text-green-500" />;
      default: return <FaSearch className="text-gray-400" />;
    }
  };

  const getContributorStatusDisplay = () => {
    if (isApproved) {
      return {
        icon: <FaCheckCircle className="text-green-500 text-xs" />,
        text: "Contributor",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
      };
    }
    if (isPending) {
      return {
        icon: <FaClock className="text-yellow-500 text-xs" />,
        text: "Pending Approval",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
      };
    }
    if (isRejected) {
      return {
        icon: <FaTimesCircle className="text-red-500 text-xs" />,
        text: "Not Approved",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
      };
    }
    return null;
  };

  const statusDisplay = userInfo && !contribLoading ? getContributorStatusDisplay() : null;

  return (
    <>
      {/* Fixed Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4">
          {/* Top Row */}
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <img src="/biizzed.png" alt="Biizzed" className="h-7 w-auto" />
              </Link>
            </div>

            <div className="flex items-center gap-1">
              {/* Create Button - Always visible */}
              <button
                onClick={handleCreateButtonClick}
                className="w-9 h-9 rounded-full bg-[#1B3766] text-white flex items-center justify-center hover:bg-[#142952] transition-colors relative group"
                title={isPending ? "Application pending approval" : isRejected ? "Application rejected" : "Create content"}
              >
                <FaPlus className="text-sm" />
                {isPending && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Brands Grid Button */}
              <div className="relative" ref={brandsRef}>
                <button
                  onClick={() => setIsBrandsOpen((prev) => !prev)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
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
                onClick={() => setShowSearch(true)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
              >
                <FaSearch className="text-sm" />
              </button>

              {userInfo ? (
                <>
                  {/* Notification Bell */}
                  <Link
                    to="/notifications"
                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors relative"
                  >
                    <FaBell className="text-sm" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
                    )}
                  </Link>
                  <Link
                    to="/profile"
                    className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                  >
                    {userInfo?.profile ? (
                      <img
                        src={userInfo.profile}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-lg" />
                    )}
                  </Link>
                </>
              ) : (
                <>
                  {/* Not Logged In - Show Login/Signup */}
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B3766] border border-[#1B3766] rounded-full hover:bg-[#1B3766] hover:text-white transition-colors"
                  >
                    <FaSignInAlt className="text-[10px]" /> Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1B3766] text-white rounded-full hover:bg-[#142952] transition-colors"
                  >
                    <FaUserPlus className="text-[10px]" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-0 border-t border-gray-100">
            {[
              { id: "feed", label: "Feed", icon: FaHome },
              { id: "articles", label: "Articles", icon: FaNewspaper },
              { id: "magazines", label: "Magazines", icon: FaBookOpen },
              { id: "videos", label: "Clips", icon: FaVideo },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all relative ${
                  activeTab === tab.id
                    ? "text-[#1B3766]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="text-sm" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#1B3766] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="h-[105px]"></div>

      {/* Contributor Prompt Modal - Dynamic based on status */}
      {showContributorPrompt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowContributorPrompt(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isPending ? 'bg-yellow-100' : isRejected ? 'bg-red-100' : 'bg-[#1B3766]/10'
              }`}>
                {isPending ? (
                  <FaClock className="text-yellow-600 text-2xl" />
                ) : isRejected ? (
                  <FaTimesCircle className="text-red-600 text-2xl" />
                ) : (
                  <FaUserEdit className="text-[#1B3766] text-2xl" />
                )}
              </div>
              
              {isPending && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Application Pending</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Your contributor application is currently being reviewed by our team.
                    You'll be notified once a decision is made. Thank you for your patience!
                  </p>
                </>
              )}
              
              {isRejected && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Application Not Approved</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Unfortunately, your contributor application was not approved at this time.
                    You can reapply after 30 days.
                  </p>
                </>
              )}
              
              {hasNotApplied && (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Become a Contributor</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    You need to be an approved contributor to create articles,
                    magazines, and videos. Apply now to share your content with the
                    community.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              {(hasNotApplied || isRejected) && (
                <button
                  onClick={() => {
                    setShowContributorPrompt(false);
                    navigate("/contributor/apply");
                  }}
                  className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center justify-center gap-2"
                >
                  {hasNotApplied ? "Apply to Contribute" : "Reapply"}
                  <FaArrowRight className="text-sm" />
                </button>
              )}
              <button
                onClick={() => setShowContributorPrompt(false)}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                {isPending ? "I Understand" : "Maybe Later"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal (only for approved contributors) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaPlus className="text-[#1B3766] text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Create New</h3>
              <p className="text-sm text-gray-500">Choose what to publish</p>
              {statusDisplay && (
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                  {statusDisplay.icon}
                  <span>{statusDisplay.text}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {createOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleCreateOption(option.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#1B3766] hover:bg-gray-50 transition-all text-left group"
                >
                  <div
                    className={`w-11 h-11 ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <option.icon className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                  <FaPlus className="text-gray-300 group-hover:text-[#1B3766] transition-colors text-xs" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full mt-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Overlay with Suggestions */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideDown">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Search</h3>
              <button
                onClick={() => setShowSearch(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search articles, magazines, videos, users..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-3 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Suggestions */}
              {(searchSuggestions.length > 0 || isSearchingSuggestions) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                    Suggestions
                  </p>
                  {isSearchingSuggestions ? (
                    <div className="flex justify-center py-4">
                      <FaSpinner className="animate-spin text-[#1B3766] text-sm" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchSuggestions.slice(0, 5).map((suggestion, idx) => (
                        <button
                          key={`${suggestion.type}-${suggestion.id}-${idx}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            {suggestion.image ? (
                              <img src={suggestion.image} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              getSuggestionIcon(suggestion.type)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{suggestion.title}</p>
                            {suggestion.subtitle && (
                              <p className="text-xs text-gray-500 truncate">{suggestion.subtitle}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  Quick Filters
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Business",
                    "Technology",
                    "Startups",
                    "Leadership",
                    "Finance",
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        navigate(
                          `/articles?category=${encodeURIComponent(cat)}`
                        );
                        setShowSearch(false);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-[#1B3766]/10 text-xs text-gray-600 hover:text-[#1B3766] rounded-lg transition-colors"
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

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.28s ease-out; }
        .animate-slideUp { animation: slideUp 0.28s ease-out; }
      `}</style>
    </>
  );
};

export default BiizzedArticlesNavbar;