// components/HeroSlimStrip.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMessageCircle } from 'react-icons/fi';

const HeroSlimStrip = () => {
  return (
    <div className="relative bg-white py-5 px-4 border-b border-gray-100">
      <div className="relative container mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Heading */}
          <h3 className="text-gray-900 text-xl sm:text-2xl font-bold">
            What's the next move for your brand?
          </h3>
          
          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-full text-white text-base font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              <span>Get Clarity</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/start-project"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 rounded-full text-blue-600 text-base font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              <span>Start Your Project</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlimStrip;