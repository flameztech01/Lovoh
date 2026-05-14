// src/screens/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFrown, FaArrowLeft, FaHome } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/'); // Fallback to home
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-[#1B3766]/10 rounded-full flex items-center justify-center">
          <FaFrown className="text-4xl text-[#1B3766]" />
        </div>

        {/* Title & Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all shadow-md"
          >
            <FaArrowLeft className="text-sm" /> Go Back
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <FaHome className="text-sm" /> Go to Homepage
          </button>
        </div>

        {/* Optional subtle hint */}
        <p className="text-xs text-gray-400 mt-6">
          Double‑check the URL or return to the previous page.
        </p>
      </div>
    </div>
  );
};

export default NotFound;