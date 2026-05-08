// components/EventFilters.jsx
import React, { useState } from 'react';

const EventFilters = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const eventTypes = ["All", "Conference", "Workshop", "Webinar", "Competition", "Forum"];
  const categories = ["All", "Marketing", "Technology", "Design", "Entrepreneurship", "Branding"];

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('filterChange', { detail: { filter } }));
  };

  return (
    <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
            <p className="text-gray-600">Discover upcoming and past events</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Event Type Filters */}
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === type
                      ? 'bg-[#1B3766] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === category
                      ? 'bg-[#79FFFF] text-[#1B3766] shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventFilters;