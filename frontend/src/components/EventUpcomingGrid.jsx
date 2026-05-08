// components/EventUpcomingGrid.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGetEventsQuery } from '../slices/eventApiSlice';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaArrowRight, FaSpinner,
} from 'react-icons/fa';

const EventUpcomingGrid = () => {
  const location = useLocation();
  const isAllEventsPage = location.pathname === '/events/all-events';

  const { data: eventsData, isLoading } = useGetEventsQuery({ 
    upcoming: 'true',
    featured: 'true',
    limit: 4,
  });

  const events = eventsData?.events || [];

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

  const formatDate = (d) => {
    if (!d) return 'TBD';
    return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <section id="events-grid" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-12 h-12 border-4 border-[#1B3766] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading events...</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section id="events-grid" className={`${isAllEventsPage ? 'pt-8 pb-4' : 'py-16'} px-4 sm:px-6 lg:px-8 bg-gray-50`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">Featured Events</h2>
          <span className="bg-[#1B3766] text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
            {events.length}
          </span>
        </div>

        {/* Event Cards - 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {events.map(event => (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              className="group relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
            >
              {/* Poster Image - Full Card */}
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                {event.images?.[0] ? (
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B3766] to-blue-800">
                    <FaCalendarAlt className="text-4xl sm:text-6xl text-white/30" />
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500" />

                {/* Featured Badge */}
                {event.featured && (
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="bg-yellow-400 text-yellow-900 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">⭐ Featured</span>
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg ${event.isPaid || event.ticketTypes?.length > 0 ? 'bg-white text-[#1B3766]' : 'bg-green-500 text-white'}`}>
                    {getEventPriceDisplay(event)}
                  </span>
                </div>

                {/* Ticket Types Badge - Only on desktop */}
                {event.ticketTypes?.length > 0 && (
                  <div className="absolute top-10 sm:top-12 right-2 sm:right-3 hidden sm:block">
                    <span className="bg-purple-500 text-white text-[9px] font-medium px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                      <FaTicketAlt className="text-[7px]" />{event.ticketTypes.length} types
                    </span>
                  </div>
                )}

                {/* Info Overlay - Shows on hover (desktop only) */}
                <div className="absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/20 hidden sm:flex">
                  <span className="bg-white/90 backdrop-blur-sm text-[#1B3766] font-bold px-6 py-3 rounded-full text-sm shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-500">
                    View Details →
                  </span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
                  <p className="text-white text-[8px] sm:text-[10px] font-medium uppercase tracking-wider mb-0.5 sm:mb-1 opacity-80 line-clamp-1">
                    {event.eventType} • {event.category}
                  </p>
                  <h3 className="text-white font-bold text-[11px] sm:text-sm leading-tight mb-1.5 sm:mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 text-white/70 text-[8px] sm:text-[10px]">
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <FaCalendarAlt className="text-[7px] sm:text-[9px]" />
                      {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                      <FaMapMarkerAlt className="text-[7px] sm:text-[9px] flex-shrink-0" />
                      <span className="truncate">{event.venue || event.location || 'TBD'}</span>
                    </span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-1 text-white/60 text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">
                      <FaClock className="text-[7px] sm:text-[8px]" />
                      {event.time}
                      {event.enableMultipleTickets && (
                        <span className="ml-auto text-[7px] sm:text-[9px] bg-white/20 px-1 sm:px-1.5 py-0.5 rounded">Multi-buy</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Events Button */}
        {!isAllEventsPage && (
          <div className="mt-8 sm:mt-10 text-center">
            <Link
              to="/events/all-events"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold text-sm hover:bg-[#142952] transition-all shadow-lg hover:shadow-xl group"
            >
              View All Events
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventUpcomingGrid;