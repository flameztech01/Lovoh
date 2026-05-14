// components/ShopSidebar.jsx
import React from 'react';
import { useGetCategoriesQuery } from '../slices/productApiSlice';

const ShopSidebar = ({ selectedCategory, onCategoryChange, searchTerm, onClearFilters }) => {
  const { data: categories, isLoading } = useGetCategoriesQuery();

  const hasActiveFilters = selectedCategory || searchTerm;

  return (
    <div className="w-full">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Filter</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-[#0043FC] hover:text-[#0033cc] font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
              Search: {searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}
              <button 
                onClick={() => onClearFilters()}
                className="ml-1 text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0043FC]/10 rounded-full text-xs text-[#0043FC]">
              {selectedCategory}
              <button 
                onClick={() => onCategoryChange('')}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="category"
                checked={!selectedCategory}
                onChange={() => onCategoryChange('')}
                className="w-4 h-4 text-[#0043FC] border-gray-300 focus:ring-[#0043FC]"
              />
              <span className={`text-sm ${!selectedCategory ? 'text-[#0043FC] font-medium' : 'text-gray-700'}`}>
                All Products
              </span>
            </label>
            
            {categories?.map((category) => (
              <label 
                key={category} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category}
                  onChange={() => onCategoryChange(category)}
                  className="w-4 h-4 text-[#0043FC] border-gray-300 focus:ring-[#0043FC]"
                />
                <span className={`text-sm ${selectedCategory === category ? 'text-[#0043FC] font-medium' : 'text-gray-700'}`}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">₦</span>
            <input
              type="number"
              placeholder="Min"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0043FC]"
              readOnly
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">₦</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0043FC]"
              readOnly
            />
          </div>
          <button className="w-full py-2 bg-[#0043FC] hover:bg-[#0033cc] text-white text-sm font-medium rounded-lg transition-colors">
            Apply
          </button>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#0043FC] border-gray-300 rounded focus:ring-[#0043FC]"
              readOnly
            />
            <span className="text-sm text-gray-700">In Stock</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-[#0043FC] border-gray-300 rounded focus:ring-[#0043FC]"
              readOnly
            />
            <span className="text-sm text-gray-700">On Sale</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShopSidebar;