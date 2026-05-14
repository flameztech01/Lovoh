// components/AllEventsNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';

const getSubdomain = () => {
  const hostname = window.location.hostname;
  if (hostname === 'eventroom.lovohcreate.com') return 'events';
  if (hostname === 'biizzed.lovohcreate.com') return 'biizzed';
  if (hostname === 'uduua.lovohcreate.com') return 'uduua';
  return 'main';
};

const currentSubdomain = getSubdomain();

const getEventsListPath = () => {
  if (currentSubdomain === 'events') return '/';
  return '/';
};

const getCreateEventPath = () => {
  if (currentSubdomain === 'events') return '/dashboard/events/new';
  return '/dashboard/events/new';
};

const AllEventsNavbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getEventsListPath());
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!searchOpen ? (
          // Normal Navbar
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left - Back → Logo → Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back Button – first item on the left */}
              <button
                onClick={handleBack}
                className="p-2 text-gray-500 hover:text-[#1B3766] hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              {/* EventRoom Logo */}
              <Link to={getEventsListPath()} className="flex-shrink-0">
                <img
                  src="/eventroom.png"
                  alt="EventRoom"
                  className="h-7 sm:h-8 w-auto"
                />
              </Link>

              {/* Title – hidden on mobile */}
              {/* <h1 className="text-sm sm:text-lg font-bold text-gray-900 hidden sm:block">
                All Events
              </h1> */}
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 sm:p-2.5 text-gray-500 hover:text-[#1B3766] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FaSearch className="text-sm sm:text-base" />
              </button>

              {/* Create Event CTA */}
              <Link
                to={getCreateEventPath()}
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