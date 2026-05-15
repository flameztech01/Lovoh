// components/BiizzedArticlesNavbar.jsx - Cleaned version (no subdomain logic, no /biizzed prefix)
import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { useGetNotificationsQuery } from "../slices/notificationApiSlice";

const BiizzedArticlesNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("feed");

  // Fetch unread notification count (only if logged in)
  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, limit: 1 },
    { skip: !userInfo }
  );
  const unreadCount = notifData?.unreadCount || 0;

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
    setShowSearch(false);
    setSearchTerm("");
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

  const handleCreateOption = (type) => {
    if (!userInfo) {
      navigate(`/login?redirect=/create-${type}`);
      setShowCreateModal(false);
      return;
    }
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
                onClick={() => setShowCreateModal(true)}
                className="w-9 h-9 rounded-full bg-[#1B3766] text-white flex items-center justify-center hover:bg-[#142952] transition-colors"
              >
                <FaPlus className="text-sm" />
              </button>
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

      {/* Create Modal */}
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
              <p className="text-sm text-gray-500">
                {userInfo
                  ? "Choose what you want to publish"
                  : "Login to start creating"}
              </p>
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

            {!userInfo && (
              <div className="mt-4 p-3 bg-[#1B3766]/5 rounded-xl text-center">
                <p className="text-xs text-gray-600 mb-2">
                  You'll need an account to publish
                </p>
                <Link
                  to="/signup"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-block px-4 py-1.5 bg-[#1B3766] text-white rounded-full text-xs font-medium hover:bg-[#142952] transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            )}

            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full mt-3 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Overlay */}
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
                    placeholder="Search articles, magazines, videos..."
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
                        navigate(`/articles?category=${encodeURIComponent(cat)}`);
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