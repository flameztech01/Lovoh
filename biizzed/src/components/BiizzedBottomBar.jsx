// components/BiizzedBottomBar.jsx - With Magazine & Clips tabs
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome, FaCompass, FaPlusCircle, FaBookOpen, FaVideo,
  FaTimes, FaNewspaper,
  FaFire, FaClock, FaStar, FaSlidersH, FaPlus,
} from "react-icons/fa";
import { toast } from "react-toastify";

// ==================== SUBDOMAIN DETECTION ====================
const hostname = window.location.hostname;

const getSubdomain = () => {
  if (hostname === 'uduua.lovohcreate.com') return 'uduua';
  if (hostname === 'biizzed.lovohcreate.com') return 'biizzed';
  if (hostname === 'event-room.lovohcreate.com') return 'events';
  return 'main';
};

const currentSubdomain = getSubdomain();
const isBiizzedSubdomain = currentSubdomain === 'biizzed';

// Helper: build correct path based on current domain context
const buildPath = (path) => {
  // On biizzed subdomain, routes have NO /biizzed/ prefix
  if (isBiizzedSubdomain && path.startsWith('/biizzed/')) {
    return path.replace('/biizzed/', '/');
  }
  // On main domain, keep the /biizzed/ prefix
  return path;
};

const BiizzedBottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isActive = (path) => {
    const cleanPath = buildPath(path);
    return location.pathname === cleanPath;
  };

  const tabs = [
    { id: "home", icon: FaHome, label: "Home", path: "/biizzed/feed" },
    { id: "explore", icon: FaCompass, label: "Explore", path: "/biizzed/articles" },
    { id: "create", icon: FaPlusCircle, label: "Create", isCreate: true },
    { id: "magazines", icon: FaBookOpen, label: "Magazines", path: "/biizzed/magazines" },
    { id: "clips", icon: FaVideo, label: "Clips", path: "/biizzed/videos" },
  ];

  const createOptions = [
    { id: 'article', label: 'Article', icon: FaNewspaper, desc: 'Write an article', color: 'bg-blue-500' },
    { id: 'magazine', label: 'Magazine', icon: FaBookOpen, desc: 'Upload a magazine', color: 'bg-purple-500' },
    { id: 'video', label: 'Clip', icon: FaVideo, desc: 'Upload a clip', color: 'bg-red-500' },
  ];

  const filterOptions = [
    { id: "trending", label: "Trending", icon: FaFire, color: "text-orange-500" },
    { id: "latest", label: "Latest", icon: FaClock, color: "text-blue-500" },
    { id: "featured", label: "Featured", icon: FaStar, color: "text-yellow-500" },
    { id: "articles", label: "Articles", icon: FaNewspaper, color: "text-purple-500" },
    { id: "magazines", label: "Magazines", icon: FaBookOpen, color: "text-green-500" },
    { id: "clips", label: "Clips", icon: FaVideo, color: "text-red-500" },
  ];

  const handleCreateClick = () => {
    if (!userInfo) {
      toast.info('Login to create content');
      navigate(buildPath('/biizzed/login?redirect=/biizzed/feed'));
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateOption = (type) => {
    setShowCreateModal(false);
    navigate(buildPath(`/biizzed/create-${type}`));
  };

  const handleFilterSelect = (filterId) => {
    let url = "/biizzed/articles";
    switch (filterId) {
      case "trending": url += "?sort=trending"; break;
      case "latest": url += "?sort=latest"; break;
      case "featured": url += "?featured=true"; break;
      case "articles": url = "/biizzed/articles"; break;
      case "magazines": url = "/biizzed/magazines"; break;
      case "clips": url = "/biizzed/videos"; break;
      default: break;
    }
    navigate(buildPath(url));
    setShowFilterModal(false);
  };

  const handleTabClick = (path) => {
    navigate(buildPath(path));
  };

  return (
    <>
      {/* Bottom Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const active = tab.path ? isActive(tab.path) : false;

            if (tab.isCreate) {
              return (
                <button key={tab.id} onClick={handleCreateClick}
                  className="flex flex-col items-center justify-center gap-0.5 -mt-3">
                  <div className="w-11 h-11 rounded-full bg-[#1B3766] text-white flex items-center justify-center shadow-lg hover:bg-[#142952] transition-colors">
                    <tab.icon className="text-xl" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{tab.label}</span>
                </button>
              );
            }

            return (
              <button key={tab.id} onClick={() => handleTabClick(tab.path)}
                className="flex flex-col items-center justify-center gap-0.5">
                <tab.icon className={`text-xl ${active ? "text-[#1B3766]" : "text-gray-400"}`} />
                <span className={`text-[10px] font-medium ${active ? "text-[#1B3766]" : "text-gray-500"}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Filter Button - Mobile Only */}
      <button onClick={() => setShowFilterModal(true)}
        className="md:hidden fixed bottom-20 right-4 z-50 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
        <FaSlidersH className="text-lg" />
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaPlus className="text-[#1B3766] text-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Create New</h3>
              <p className="text-sm text-gray-500">Choose what to publish</p>
            </div>

            <div className="space-y-3">
              {createOptions.map((option) => (
                <button key={option.id} onClick={() => handleCreateOption(option.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#1B3766] hover:bg-gray-50 transition-all text-left group">
                  <div className={`w-11 h-11 ${option.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <option.icon className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                  <FaPlus className="text-gray-300 group-hover:text-[#1B3766] transition-colors text-xs" />
                </button>
              ))}
            </div>

            <button onClick={() => setShowCreateModal(false)}
              className="w-full mt-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilterModal(false)} />
          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-slideUp p-5 pb-8">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Content</h3>
            <div className="grid grid-cols-3 gap-3">
              {filterOptions.map((option) => (
                <button key={option.id} onClick={() => handleFilterSelect(option.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-[#1B3766]/5 transition-colors border border-gray-100">
                  <option.icon className={`text-2xl ${option.color}`} />
                  <span className="text-xs font-medium text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilterModal(false)}
              className="w-full mt-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="md:hidden h-20"></div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default BiizzedBottomBar;