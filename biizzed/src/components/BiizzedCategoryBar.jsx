// components/BiizzedCategoryBar.jsx
import React, { useState, useEffect } from 'react';
import { useGetMagazineStatsQuery } from '../slices/magApiSlice';

const BiizzedCategoryBar = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: statsData } = useGetMagazineStatsQuery();
  
  const categories = statsData?.categories || [
    "Business", "Technology", "Leadership", "Innovation", "Marketing", "Finance"
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    window.dispatchEvent(new CustomEvent('categoryChange', { detail: { category } }));
  };

  return (
    <div className="sticky top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto whitespace-nowrap py-3 scrollbar-hide">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Browse</span>
            <div className="w-px h-4 bg-gray-200"></div>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeCategory === 'All' 
                  ? 'bg-[#1B3766] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#1B3766]'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-[#1B3766] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#1B3766]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs text-gray-400">Trending</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BiizzedCategoryBar;