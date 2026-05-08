// components/PackageCard.jsx
import React from 'react';
import { FaRegClock, FaChevronDown } from 'react-icons/fa';

const PackageCard = ({ pkg, onSelect, onOpenModal, isMobile = false }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
        isMobile ? 'w-[280px] flex-shrink-0 h-full flex flex-col' : 'h-full flex flex-col'
      }`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${pkg.bgGradient} p-4 text-white`}>
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
          {pkg.icon}
        </div>
        <h3 className="text-lg font-bold leading-tight">{pkg.name}</h3>
        <p className="text-white/80 text-xs mt-0.5">{pkg.tagline}</p>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* TEXT AREA (fills space) */}
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-6">
            {pkg.fullDescription}
          </p>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-3">
            <FaRegClock className="text-blue-600 w-3 h-3" />
            <span>{pkg.timeline}</span>
          </div>
        </div>

        {/* Read More */}
        <button
          type="button"
          onClick={() => onOpenModal(pkg)}
          className="flex items-center gap-1 text-blue-600 text-xs font-medium hover:text-blue-800 transition-colors mb-3"
        >
          View Details <FaChevronDown className="w-3 h-3" />
        </button>

        {/* Select */}
        <button
          type="button"
          onClick={onSelect}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all duration-300"
        >
          Select Package
        </button>
      </div>
    </div>
  );
};

export default PackageCard;