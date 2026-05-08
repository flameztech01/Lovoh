// screens/AllEvents.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetEventsQuery } from '../slices/eventApiSlice';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt,
  FaSpinner, FaArrowRight, FaUsers, FaSearch, FaTimes,
  FaSlidersH,
} from 'react-icons/fa';
import AllEventsNavbar from '../components/AllEventsNavbar';
import EventUpcomingGrid from '../components/EventUpcomingGrid';
import Footer from '../components/Footer';

const AllEvents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: eventsData, isLoading } = useGetEventsQuery({
    upcoming: 'true',
    limit: 50,
  });

  const events = eventsData?.events || [];
  const categories = [...new Set(events.map(e => e.category).filter(Boolean))];
  const eventTypes = [...new Set(events.map(e => e.eventType).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

  const getEventPriceDisplay = (e) => {
    if (e.ticketTypes?.length > 0) {
      const prices = e.ticketTypes.map(t => t.price).filter(p => p > 0);
      if (prices.length === 0) return 'Free';
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `₦${min.toLocaleString()}` : `₦${min.toLocaleString()}+`;
    }
    return e.isPaid && e.price > 0 ? `₦${e.price.toLocaleString()}` : 'Free';
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || typeFilter !== 'all';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="flex justify-center items-center h-64 pt-16">
          <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />

      {/* Main Content - with top padding for fixed navbar */}
      <div className="pt-14 sm:pt-16">
        {/* Featured Events Section */}
        <EventUpcomingGrid />

        {/* All Events List Section */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Events</h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 lg:w-56 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"><FaTimes className="text-xs" /></button>}
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]">
                  <option value="all">All Types</option>
                  {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Events Grid - Desktop Cards */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                filteredEvents.map(event => (
                  <Link key={event._id} to={`/events/${event._id}`}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                      {event.images?.[0] ? (
                        <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B3766]/10 to-blue-100"><FaCalendarAlt className="text-5xl text-[#1B3766]/30" /></div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-md ${event.isPaid || event.ticketTypes?.length > 0 ? 'bg-white text-[#1B3766]' : 'bg-green-500 text-white'}`}>{getEventPriceDisplay(event)}</span>
                      </div>
                      {event.featured && <div className="absolute top-3 left-3"><span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">⭐ Featured</span></div>}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{event.eventType}</span>
                        <span className="text-[10px] text-gray-400">{event.category}</span>
                        {event.ticketTypes?.length > 0 && <span className="text-[9px] text-purple-600 font-medium"><FaTicketAlt className="inline text-[7px] mr-0.5" />{event.ticketTypes.length}</span>}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#1B3766] transition-colors line-clamp-2 mb-2 flex-1">{event.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{stripHtml(event.description)?.substring(0, 100)}</p>
                      <div className="text-[10px] text-gray-500 space-y-1 mb-3">
                        <div className="flex items-center gap-1"><FaCalendarAlt className="text-[#1B3766] text-[10px]" />{formatDate(event.date)} • {event.time || 'TBD'}</div>
                        <div className="flex items-center gap-1"><FaMapMarkerAlt className="text-[#1B3766] text-[10px]" /><span className="truncate">{event.venue || event.location}</span></div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-[10px] text-gray-400"><FaUsers className="inline mr-1" />{event.currentAttendees || 0}</span>
                        <span className="text-[#1B3766] font-semibold text-xs group-hover:gap-1.5 transition-all flex items-center gap-1">View <FaArrowRight className="text-[10px]" /></span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Events List - Mobile */}
            <div className="sm:hidden space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                filteredEvents.map(event => (
                  <Link key={event._id} to={`/events/${event._id}`}
                    className="group flex gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition-all duration-300">
                    <div className="w-28 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                      {event.images?.[0] ? (
                        <img src={event.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B3766]/10 to-blue-100"><FaCalendarAlt className="text-2xl text-[#1B3766]/30" /></div>
                      )}
                      <div className="absolute top-1.5 right-1.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${event.isPaid || event.ticketTypes?.length > 0 ? 'bg-white text-[#1B3766]' : 'bg-green-500 text-white'}`}>{getEventPriceDisplay(event)}</span>
                      </div>
                      {event.featured && <div className="absolute top-1.5 left-1.5"><span className="bg-yellow-400 text-yellow-900 text-[7px] font-bold px-1 py-0.5 rounded-full">⭐</span></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-semibold text-blue-600 uppercase">{event.eventType}</span>
                        {event.ticketTypes?.length > 0 && <span className="text-[8px] text-purple-600"><FaTicketAlt className="inline text-[6px]" />{event.ticketTypes.length}</span>}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">{event.title}</h3>
                      <div className="text-[10px] text-gray-500 space-y-0.5">
                        <div className="flex items-center gap-1"><FaCalendarAlt className="text-[#1B3766] text-[9px]" />{formatDate(event.date)} • {event.time || 'TBD'}</div>
                        <div className="flex items-center gap-1"><FaMapMarkerAlt className="text-[#1B3766] text-[9px]" /><span className="truncate">{event.venue || event.location}</span></div>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
                        <span className="text-[9px] text-gray-400"><FaUsers className="inline mr-0.5 text-[8px]" />{event.currentAttendees || 0}</span>
                        <span className="text-[#1B3766] font-semibold text-[10px] flex items-center gap-0.5">View <FaArrowRight className="text-[8px]" /></span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Floating Filter Button */}
      <div className="sm:hidden fixed bottom-6 right-4 z-30 flex flex-col items-end gap-3">
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72 animate-fadeInUp">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-red-500 font-medium">Clear</button>}
                <button onClick={() => setShowFilters(false)} className="p-1 text-gray-400 hover:text-gray-600"><FaTimes className="text-xs" /></button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><FaTimes className="text-xs" /></button>}
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]">
                <option value="all">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]">
                <option value="all">All Types</option>{eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
        <button onClick={() => setShowFilters(!showFilters)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            showFilters ? 'bg-gray-800 text-white rotate-90' : 'bg-[#1B3766] text-white'
          } ${hasActiveFilters && !showFilters ? 'ring-4 ring-[#1B3766]/30' : ''}`}>
          <FaSlidersH className="text-lg" />
        </button>
        {hasActiveFilters && !showFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out; }
      `}</style>

      <Footer />
    </div>
  );
};

export default AllEvents;