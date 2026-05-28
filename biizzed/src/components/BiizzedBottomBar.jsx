// components/BiizzedBottomBar.jsx – Contributor-gated create button with proper status handling
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome, FaCompass, FaPlusCircle, FaBookOpen, FaVideo,
  FaNewspaper,
  FaFire, FaClock, FaStar, FaSlidersH, FaPlus,
  FaUserEdit, FaArrowRight, FaSpinner, FaClock as FaPending, FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetContributorStatusQuery } from "../slices/contributorApiSlice";

const BiizzedBottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributorPrompt, setShowContributorPrompt] = useState(false);

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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const tabs = [
    { id: "home", icon: FaHome, label: "Home", path: "/feed" },
    { id: "explore", icon: FaCompass, label: "Explore", path: "/articles" },
    { id: "create", icon: FaPlusCircle, label: "Create", isCreate: true },
    { id: "magazines", icon: FaBookOpen, label: "Magazines", path: "/magazines" },
    { id: "clips", icon: FaVideo, label: "Clips", path: "/videos" },
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
      navigate('/login?redirect=/feed');
      return;
    }

    // If still loading contributor status, show loading message
    if (contribLoading) {
      toast.info("Checking contributor status...");
      return;
    }

    // If approved, show create modal
    if (isApproved) {
      setShowCreateModal(true);
      return;
    }

    // If pending, show pending message prompt
    if (isPending) {
      setShowContributorPrompt(true);
      return;
    }

    // If not applied or rejected, show apply prompt
    setShowContributorPrompt(true);
  };

  const handleCreateOption = (type) => {
    setShowCreateModal(false);
    navigate(`/create-${type}`);
  };

  const handleFilterSelect = (filterId) => {
    let url = "/articles";
    switch (filterId) {
      case "trending": url += "?sort=trending"; break;
      case "latest": url += "?sort=latest"; break;
      case "featured": url += "?featured=true"; break;
      case "articles": url = "/articles"; break;
      case "magazines": url = "/magazines"; break;
      case "clips": url = "/videos"; break;
      default: break;
    }
    navigate(url);
    setShowFilterModal(false);
  };

  const handleTabClick = (path) => {
    navigate(path);
  };

  // Get contributor status display for create modal
  const getStatusDisplay = () => {
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
        icon: <FaPending className="text-yellow-500 text-xs" />,
        text: "Pending Approval",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
      };
    }
    return null;
  };

  const statusDisplay = userInfo && !contribLoading ? getStatusDisplay() : null;

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
                  className="flex flex-col items-center justify-center gap-0.5 -mt-3 relative group">
                  <div className={`w-11 h-11 rounded-full bg-[#1B3766] text-white flex items-center justify-center shadow-lg hover:bg-[#142952] transition-colors ${
                    isPending ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                  }`}>
                    <tab.icon className="text-xl" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{tab.label}</span>
                  {isPending && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                  )}
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

      {/* Contributor Prompt Modal - Dynamic based on status */}
      {showContributorPrompt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowContributorPrompt(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isPending ? 'bg-yellow-100' : isRejected ? 'bg-red-100' : 'bg-[#1B3766]/10'
              }`}>
                {isPending ? (
                  <FaPending className="text-yellow-600 text-2xl" />
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
                    You need to be an approved contributor to create articles, magazines, and videos. 
                    Apply now to share your content with the community.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              {(hasNotApplied || isRejected) && (
                <button
                  onClick={() => {
                    setShowContributorPrompt(false);
                    navigate('/contributor/apply');
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
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