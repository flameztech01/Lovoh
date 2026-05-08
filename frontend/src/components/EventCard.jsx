// components/EventCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaClock,
} from 'react-icons/fa';

const EventCard = ({ event, isUpcoming = true }) => {
  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatPrice = (price, isPaid) => {
    if (!isPaid || !price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
    }).format(price);
  };

  const coverImage = event.images?.[0] || '/now1.jpg';
  const isPaid = event.isPaid && event.price > 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Price Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
          isPaid ? 'bg-[#1B3766] text-white' : 'bg-green-500 text-white'
        }`}>
          {formatPrice(event.price, event.isPaid)}
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-[#1B3766]">
            {event.category}
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Event Type */}
        {event.eventType && (
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-2">
            {event.eventType}
          </span>
        )}

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1B3766] transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaCalendarAlt className="text-[#1B3766] text-xs flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
            {event.time && (
              <>
                <FaClock className="text-[#1B3766] text-xs flex-shrink-0 ml-2" />
                <span>{event.time}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="text-[#1B3766] text-xs flex-shrink-0" />
            <span className="truncate">{event.venue || event.location || 'TBD'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUsers className="text-[#1B3766] text-xs flex-shrink-0" />
            <span>
              {event.currentAttendees || 0} 
              {event.maxAttendees > 0 ? ` / ${event.maxAttendees}` : ''} registered
            </span>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className={`text-xs font-medium ${isUpcoming ? 'text-green-600' : 'text-gray-400'}`}>
            {isUpcoming ? '● Open for Registration' : '● Past Event'}
          </span>
          <span className="text-sm font-semibold text-[#1B3766] group-hover:translate-x-1 transition-transform">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;