// screens/EventDashboardEvents.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlus, FaEdit, FaTrashAlt, FaEye, FaSearch, FaTimes,
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTicketAlt,
  FaDollarSign, FaSpinner, FaCheckCircle, FaCalendarCheck,
  FaExclamationTriangle, FaBan, FaUserFriends, FaChevronRight,
} from 'react-icons/fa';
import { useGetMyEventsQuery, useDeleteEventMutation } from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardEvents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventToDelete, setEventToDelete] = useState(null);

  const { data: events, isLoading, refetch } = useGetMyEventsQuery();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD';
  
  const getEventPriceDisplay = (e) => {
    if (e.ticketTypes?.length > 0) {
      const prices = e.ticketTypes.map(t => t.price).filter(p => p > 0);
      if (prices.length === 0) return 'Free';
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `₦${min.toLocaleString()}` : `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
    }
    return e.isPaid && e.price > 0 ? `₦${e.price.toLocaleString()}` : 'Free';
  };

  const getEventRevenue = (e) => {
    if (e.ticketTypes?.length > 0) {
      return e.ticketTypes.reduce((sum, t) => sum + ((t.soldCount || 0) * (t.price || 0)), 0);
    }
    return (e.currentAttendees || 0) * (e.price || 0);
  };

  const getEventStatus = (event) => {
    if (event.isDisabled) return { label: 'Disabled', color: 'bg-gray-100 text-gray-700', icon: FaBan };
    if (event.status === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaTimes };
    return new Date(event.date) < new Date() 
      ? { label: 'Past', color: 'bg-gray-100 text-gray-600', icon: FaCalendarCheck }
      : { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
  };

  const filteredEvents = (events || []).filter(event => {
    if (searchTerm === '') return true;
    const s = searchTerm.toLowerCase();
    return event.title?.toLowerCase().includes(s) || event.category?.toLowerCase().includes(s) || event.location?.toLowerCase().includes(s);
  }).filter(event => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'upcoming') return new Date(event.date) >= new Date() && !event.isDisabled;
    if (statusFilter === 'past') return new Date(event.date) < new Date();
    if (statusFilter === 'disabled') return event.isDisabled;
    return true;
  });

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try { await deleteEvent(eventToDelete._id).unwrap(); toast.success(`"${eventToDelete.title}" deleted`); setEventToDelete(null); refetch(); }
    catch (error) { toast.error(error?.data?.message || 'Failed to delete'); }
  };

  if (isLoading) return (<EventDashboardSidebar><div className="flex justify-center items-center h-96"><FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" /></div></EventDashboardSidebar>);

  const totalRegistrations = events?.reduce((sum, e) => sum + (e.currentAttendees || 0), 0) || 0;
  const totalRevenue = events?.reduce((sum, e) => sum + getEventRevenue(e), 0) || 0;
  const upcomingCount = events?.filter(e => new Date(e.date) >= new Date() && !e.isDisabled).length || 0;

  return (
    <EventDashboardSidebar>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 mt-1 text-sm">{events?.length || 0} event{(events?.length || 0) !== 1 ? 's' : ''} created</p>
        </div>
        <Link to="/events/dashboard/events/new" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all text-sm"><FaPlus /> Create Event</Link>
      </div>

      {/* Stats - Mobile friendly grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500">Total Events</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">{events?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500">Upcoming</p>
          <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500">Registrations</p>
          <p className="text-lg sm:text-xl font-bold text-purple-600 mt-0.5">{totalRegistrations}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500">Revenue</p>
          <p className="text-sm sm:text-lg font-bold text-orange-600 mt-0.5 truncate">₦{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-8 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"><FaTimes className="text-xs" /></button>}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Events</option><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 sm:py-16 px-4">
          <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><FaCalendarAlt className="text-2xl sm:text-3xl text-gray-400" /></div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{searchTerm ? 'No matching events' : 'No events created yet'}</h3>
          <p className="text-gray-500 mb-6 text-xs sm:text-sm">{searchTerm ? 'Try a different search term.' : 'Create your first event to get started.'}</p>
          {!searchTerm && <Link to="/events/dashboard/events/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-all text-sm"><FaPlus /> Create Your First Event</Link>}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            const StatusIcon = status.icon;
            const hasTicketTypes = event.ticketTypes?.length > 0;
            const hasMultiBuy = event.enableMultipleTickets;

            return (
              <div key={event._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${event.isDisabled ? 'border-gray-200 opacity-70' : 'border-gray-100'}`}>
                {/* Desktop Layout */}
                <div className="hidden sm:flex flex-row">
                  <div className="w-40 lg:w-48 flex-shrink-0 bg-gray-100">
                    {event.images?.[0] ? <img src={event.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full min-h-[140px] flex items-center justify-center"><FaCalendarAlt className="text-4xl text-gray-300" /></div>}
                  </div>
                  <div className="flex-1 p-4 lg:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}><StatusIcon className="text-[10px]" /> {status.label}</span>
                          {(event.isPaid || hasTicketTypes) && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"><FaDollarSign className="text-[10px]" /> {getEventPriceDisplay(event)}</span>}
                          {hasTicketTypes && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"><FaTicketAlt className="text-[10px]" /> {event.ticketTypes.length} types</span>}
                          {hasMultiBuy && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"><FaUserFriends className="text-[10px]" /> Multi-buy</span>}
                          {event.reportCount > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium"><FaExclamationTriangle className="text-[10px]" /> {event.reportCount}</span>}
                        </div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1.5 truncate">{event.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs lg:text-sm text-gray-500">
                          <span className="flex items-center gap-1"><FaCalendarAlt className="text-[10px] text-gray-400" />{formatDate(event.date)} at {event.time || 'TBD'}</span>
                          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[10px] text-gray-400" />{event.venue || event.location || 'TBD'}</span>
                          <span className="flex items-center gap-1"><FaUsers className="text-[10px] text-gray-400" />{event.currentAttendees || 0} / {event.maxAttendees > 0 ? event.maxAttendees : '∞'} registered</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => navigate(`/events/dashboard/events/${event._id}`)} className="flex items-center gap-1 px-2.5 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"><FaEye className="text-[10px]" /> View</button>
                      <button onClick={() => navigate(`/events/dashboard/events/${event._id}/edit`)} className="flex items-center gap-1 px-2.5 py-1.5 text-green-600 hover:bg-green-50 rounded-lg text-xs"><FaEdit className="text-[10px]" /> Edit</button>
                      <button onClick={() => navigate(`/events/dashboard/events/${event._id}/registrations`)} className="flex items-center gap-1 px-2.5 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg text-xs"><FaTicketAlt className="text-[10px]" /> Registrations ({event.currentAttendees || 0})</button>
                      <button onClick={() => setEventToDelete(event)} className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs ml-auto"><FaTrashAlt className="text-[10px]" /> Delete</button>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="sm:hidden p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {event.images?.[0] ? <img src={event.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaCalendarAlt className="text-xl text-gray-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}><StatusIcon className="text-[8px]" /> {status.label}</span>
                        {(event.isPaid || hasTicketTypes) && <span className="text-[10px] text-blue-600 font-medium">{getEventPriceDisplay(event)}</span>}
                        {hasTicketTypes && <span className="text-[10px] text-purple-600">{event.ticketTypes.length} types</span>}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                        <div className="flex items-center gap-1"><FaCalendarAlt className="text-[8px]" />{formatDate(event.date)} • {event.time || 'TBD'}</div>
                        <div className="flex items-center gap-1"><FaMapMarkerAlt className="text-[8px]" />{event.venue || event.location || 'TBD'}</div>
                        <div className="flex items-center gap-1"><FaUsers className="text-[8px]" />{event.currentAttendees || 0} registered</div>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 text-xs mt-1 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/events/dashboard/events/${event._id}`)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1"><FaEye className="text-[8px]" /> View</button>
                    <button onClick={() => navigate(`/events/dashboard/events/${event._id}/edit`)} className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1"><FaEdit className="text-[8px]" /> Edit</button>
                    <button onClick={() => navigate(`/events/dashboard/events/${event._id}/registrations`)} className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1"><FaTicketAlt className="text-[8px]" /> Reg.</button>
                    <button onClick={() => setEventToDelete(event)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1"><FaTrashAlt className="text-[8px]" /> Del</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEventToDelete(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><FaTrashAlt className="text-xl text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
              <p className="text-sm text-gray-500 mb-6">Delete "{eventToDelete.title}"? All registrations will be removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setEventToDelete(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </EventDashboardSidebar>
  );
};

export default EventDashboardEvents;