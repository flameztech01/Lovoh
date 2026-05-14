// screens/EventDashboardRegistrations.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaTicketAlt,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaChair,
  FaEye,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useGetMyRegistrationsQuery } from '../slices/eventApiSlice';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardRegistrations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: registrations, isLoading } = useGetMyRegistrationsQuery();

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle };
      case 'pending':
        return { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: FaClock };
      case 'failed':
        return { label: 'Failed', color: 'bg-red-100 text-red-700', icon: FaTimes };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: FaTimes };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle };
    }
  };

  const filteredRegistrations = (registrations || []).filter(reg => {
    if (searchTerm === '') return true;
    const search = searchTerm.toLowerCase();
    return (
      reg.event?.title?.toLowerCase().includes(search) ||
      reg.ticketId?.toLowerCase().includes(search) ||
      reg.seatNumber?.toLowerCase().includes(search)
    );
  }).filter(reg => {
    if (statusFilter === 'all') return true;
    return reg.status === statusFilter;
  });

  const openDetailsModal = (reg) => {
    setSelectedReg(reg);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <EventDashboardSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </EventDashboardSidebar>
    );
  }

  return (
    <EventDashboardSidebar>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Registrations</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Events you've registered for
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Tickets</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{registrations?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Confirmed</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {registrations?.filter(r => r.status === 'confirmed').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">
            {registrations?.filter(r => r.status === 'pending').length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event name, ticket ID, or seat number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FaTicketAlt className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching registrations' : 'No registrations yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {searchTerm ? 'Try a different search term.' : 'Register for events to see your tickets here.'}
          </p>
          {!searchTerm && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-all text-sm"
            >
              Browse Events
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRegistrations.map((reg) => {
            const status = getStatusBadge(reg.status);
            const StatusIcon = status.icon;

            return (
              <div
                key={reg._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Ticket Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    reg.status === 'confirmed' ? 'bg-green-100' : 
                    reg.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <FaTicketAlt className={`text-lg ${
                      reg.status === 'confirmed' ? 'text-green-600' : 
                      reg.status === 'pending' ? 'text-yellow-600' : 'text-gray-400'
                    }`} />
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {reg.event?.title || 'Event Unavailable'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" /> {formatDate(reg.event?.date)}
                      </span>
                      {reg.event?.location && (
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" /> {reg.event.location}
                        </span>
                      )}
                    </div>
                    {/* Ticket Details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                      {reg.ticketId && (
                        <span className="font-mono">🎫 {reg.ticketId}</span>
                      )}
                      {reg.seatNumber && (
                        <span className="flex items-center gap-1">
                          <FaChair className="text-[10px]" /> Seat: {reg.seatNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="text-[10px]" /> {status.label}
                    </span>
                    <button
                      onClick={() => openDetailsModal(reg)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Check-in Status */}
                {reg.status === 'confirmed' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {reg.ticketCheckedIn ? (
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                        ✅ Checked in: {formatDateTime(reg.checkedInAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">⏳ Not checked in yet</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                selectedReg.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <FaTicketAlt className={`text-2xl ${
                  selectedReg.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
            </div>

            {/* Ticket Card */}
            <div className="border-2 border-dashed border-[#1B3766] rounded-xl p-4 mb-4">
              {selectedReg.ticketId && (
                <div className="bg-[#1B3766] text-white text-center py-2 rounded-lg mb-3">
                  <p className="text-xs text-[#79FFFF]">TICKET ID</p>
                  <p className="text-lg font-bold tracking-wider">{selectedReg.ticketId}</p>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <p><strong>Event:</strong> {selectedReg.event?.title || 'N/A'}</p>
                <p><strong>Date:</strong> {formatDate(selectedReg.event?.date)}</p>
                <p><strong>Time:</strong> {selectedReg.event?.time || 'TBD'}</p>
                <p><strong>Location:</strong> {selectedReg.event?.location || selectedReg.event?.venue || 'TBD'}</p>
                <p><strong>Attendee:</strong> {selectedReg.name}</p>
                <p><strong>Email:</strong> {selectedReg.email}</p>
                {selectedReg.seatNumber && <p><strong>Seat:</strong> {selectedReg.seatNumber}</p>}
                <p><strong>Status:</strong> {getStatusBadge(selectedReg.status).label}</p>
                {selectedReg.ticketCheckedIn && (
                  <p className="text-green-600"><strong>Checked In:</strong> {formatDateTime(selectedReg.checkedInAt)}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </EventDashboardSidebar>
  );
};

export default EventDashboardRegistrations;