// adminScreen/AdminEvents.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaTicketAlt,
  FaDollarSign,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaCalendarDay,
  FaExclamationTriangle,
  FaUser,
  FaBan,
  FaCheck,
  FaMapMarkerAlt,
  FaVideo,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import {
  useGetEventsQuery,
  useDeleteEventMutation,
  useToggleEventStatusMutation,
  useGetAdminDashboardQuery,
  useGetEventFiltersQuery,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEvents = () => {
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToToggle, setEventToToggle] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null); // For ticket types details
  const itemsPerPage = 12;

  // Fetch events with filters
  const { data: eventsData, isLoading, refetch } = useGetEventsQuery({
    search: searchTerm || undefined,
    category: categoryFilter || undefined,
    eventType: typeFilter || undefined,
    status: statusFilter || undefined,
    creatorType: creatorFilter || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch dashboard stats
  const { data: dashboardData } = useGetAdminDashboardQuery();

  // Fetch available filters
  const { data: filtersData } = useGetEventFiltersQuery();

  // Mutations
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [toggleEventStatus, { isLoading: isToggling }] = useToggleEventStatusMutation();

  // Extract data
  const events = eventsData?.events || [];
  const totalPages = eventsData?.pages || 1;
  const totalEvents = eventsData?.total || 0;
  const dashboard = dashboardData || {};
  const availableCategories = filtersData?.categories || [];
  const availableTypes = filtersData?.eventTypes || [];

  // Helper: Get event status
  const getEventStatusInfo = (event) => {
    if (event.isDisabled) {
      return { label: 'Disabled', color: 'bg-gray-100 text-gray-700', icon: FaBan };
    }
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: FaTimesCircle };
    }
    if (event.status === 'postponed') {
      return { label: 'Postponed', color: 'bg-yellow-100 text-yellow-700', icon: FaCalendarDay };
    }
    if (event.status === 'ongoing' && eventDate.toDateString() === now.toDateString()) {
      return { label: 'Ongoing', color: 'bg-blue-100 text-blue-700', icon: FaCheckCircle };
    }
    if (eventDate < now) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-600', icon: FaCalendarCheck };
    }
    return { label: 'Upcoming', color: 'bg-green-100 text-green-700', icon: FaCheckCircle };
  };

  // Helper: Format date
  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper: Format time
  const formatTime = (time) => {
    if (!time) return '';
    try {
      return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  };

  // Helper: Format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper: Get price range from ticket types
  const getPriceRange = (event) => {
    if (!event.isPaid) return { display: 'Free', min: 0, max: 0, hasMultiple: false };
    
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = event.ticketTypes.map(t => t.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const hasMultiple = event.ticketTypes.length > 1;
      
      if (min === max) {
        return { display: formatCurrency(min), min, max, hasMultiple: false };
      }
      return { 
        display: `${formatCurrency(min)} - ${formatCurrency(max)}`, 
        min, 
        max, 
        hasMultiple: true 
      };
    }
    
    return { 
      display: formatCurrency(event.price), 
      min: event.price, 
      max: event.price, 
      hasMultiple: false 
    };
  };

  // Helper: Get total tickets sold for event
  const getTotalTicketsSold = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + (t.soldCount || 0), 0);
    }
    return event.currentAttendees || 0;
  };

  // Helper: Get total seats sold (accounting for seatsPerTicket)
  const getTotalSeatsSold = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + ((t.soldCount || 0) * (t.seatsPerTicket || 1)), 0);
    }
    return event.currentAttendees || 0;
  };

  // Calculate revenue for paid events
  const getTotalRevenue = (event) => {
    if (!event.isPaid) return 0;
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + ((t.soldCount || 0) * t.price), 0);
    }
    return (event.currentAttendees || 0) * (event.price || 0);
  };

  // Handlers
  const handleDeleteClick = (event) => setEventToDelete(event);

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete._id).unwrap();
      toast.success(`"${eventToDelete.title}" deleted successfully`);
      setEventToDelete(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete event');
    }
  };

  const handleToggleClick = (event) => setEventToToggle(event);

  const confirmToggle = async () => {
    if (!eventToToggle) return;
    try {
      const result = await toggleEventStatus({
        id: eventToToggle._id,
        data: {
          reason: eventToToggle.isDisabled ? '' : 'Disabled by admin',
        },
      }).unwrap();
      
      toast.success(result.message || (eventToToggle.isDisabled ? 'Event enabled' : 'Event disabled'));
      setEventToToggle(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update event status');
    }
  };

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setCreatorFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || categoryFilter || typeFilter || statusFilter || creatorFilter;

  // Loading state
  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading events...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage all events across the platform</p>
          </div>
          <button
            onClick={() => navigate('/admin/events/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FaPlus />
            Create Event
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{dashboard.totalEvents || totalEvents}</p>
              </div>
              <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Events</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{dashboard.activeEvents || 0}</p>
              </div>
              <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Registrations</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{dashboard.totalRegistrations || 0}</p>
              </div>
              <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center">
                <FaUsers className="text-purple-600 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Event Creators</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{dashboard.totalCreators || 0}</p>
              </div>
              <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center">
                <FaUser className="text-orange-600 text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="passed">Past</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>

              <select
                value={creatorFilter}
                onChange={(e) => {
                  setCreatorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">All Creators</option>
                <option value="admin">Admin</option>
                <option value="user">Users</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Events List - Card View for better detail display */}
        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters
                ? 'No events match your current filters. Try adjusting them.'
                : 'Get started by creating your first event!'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={() => navigate('/admin/events/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] transition-all"
              >
                <FaPlus />
                Create Event
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {events.map((event) => {
                const statusInfo = getEventStatusInfo(event);
                const StatusIcon = statusInfo.icon;
                const priceRange = getPriceRange(event);
                const totalTickets = getTotalTicketsSold(event);
                const totalSeats = getTotalSeatsSold(event);
                const totalRevenue = getTotalRevenue(event);
                const isExpanded = expandedEvent === event._id;

                return (
                  <div
                    key={event._id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all ${
                      event.isDisabled ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Main Row */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            {/* Event Image or Placeholder */}
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {event.images?.[0] ? (
                                <img
                                  src={event.images[0]}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaCalendarAlt className="text-gray-400 text-xl" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {event.title}
                                </h3>
                                {event.isVirtual && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                    <FaVideo className="text-[10px]" />
                                    Virtual
                                  </span>
                                )}
                                {event.featured && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                                    Featured
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                                <span className="inline-flex items-center gap-1">
                                  <FaCalendarAlt className="text-gray-400" />
                                  {formatDate(event.date)}
                                </span>
                                {event.time && (
                                  <span className="inline-flex items-center gap-1">
                                    {formatTime(event.time)}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                  <FaMapMarkerAlt className="text-gray-400" />
                                  <span className="truncate max-w-[200px]">
                                    {event.isVirtual ? 'Online Event' : event.venue || event.location}
                                  </span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  {event.category}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  {event.eventType}
                                </span>
                                {event.tags?.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            {/* Ticket Types / Pricing */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Pricing</p>
                              {event.isPaid ? (
                                <div>
                                  <p className="text-sm font-semibold text-green-700">
                                    {priceRange.display}
                                  </p>
                                  {priceRange.hasMultiple && (
                                    <button
                                      onClick={() => toggleExpand(event._id)}
                                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                                    >
                                      <FaLayerGroup className="text-[10px]" />
                                      {event.ticketTypes.length} ticket types
                                      {isExpanded ? (
                                        <FaChevronUp className="text-[8px]" />
                                      ) : (
                                        <FaChevronDown className="text-[8px]" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-gray-400">Free Event</span>
                              )}
                            </div>

                            {/* Registrations */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Registrations</p>
                              <div className="flex items-center gap-1.5">
                                <FaUsers className="text-gray-400 text-sm" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {totalTickets} tickets
                                </span>
                              </div>
                              {totalSeats > totalTickets && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {totalSeats} seats across {totalTickets} tickets
                                </p>
                              )}
                              {event.maxAttendees > 0 && (
                                <div className="mt-1">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-600 h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          (totalSeats / event.maxAttendees) * 100,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {totalSeats} / {event.maxAttendees} capacity
                                    {event.maxAttendees > 0 && totalSeats >= event.maxAttendees && (
                                      <span className="text-red-600 ml-1">(Full)</span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Revenue (Paid events only) */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Revenue</p>
                              {event.isPaid ? (
                                <div className="flex items-center gap-1.5">
                                  <FaDollarSign className="text-green-600 text-sm" />
                                  <span className="text-sm font-semibold text-green-700">
                                    {formatCurrency(totalRevenue)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">N/A</span>
                              )}
                            </div>

                            {/* Max Tickets Per Order */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Max Per Order</p>
                              <div className="flex items-center gap-1.5">
                                <FaTicketAlt className="text-purple-500 text-sm" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {event.enableMultipleTickets ? event.maxTicketsPerOrder : '1'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Creator & Status */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {event.createdBy?.profile ? (
                                  <img
                                    src={event.createdBy.profile}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FaUser className="text-gray-500 text-xs" />
                                )}
                              </div>
                              <span className="text-xs text-gray-600">
                                {event.createdBy?.name || 'Unknown'} • {event.creatorType === 'admin' ? 'Admin' : 'User'}
                              </span>
                              {event.reportCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                  <FaExclamationTriangle className="text-[10px]" />
                                  {event.reportCount}
                                </span>
                              )}
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon className="text-[10px]" />
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => navigate(`/admin/events/${event._id}`)}
                              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                              title="View Event"
                            >
                              <FaEye />
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                              className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                              title="Edit Event"
                            >
                              <FaEdit />
                              Edit
                            </button>
                            <button
                              onClick={() => navigate(`/admin/events/${event._id}/registrations`)}
                              className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1"
                              title="View Registrations"
                            >
                              <FaTicketAlt />
                              Registrations
                            </button>
                            <button
                              onClick={() => handleToggleClick(event)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                                event.isDisabled
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`}
                              title={event.isDisabled ? 'Enable Event' : 'Disable Event'}
                            >
                              {event.isDisabled ? <FaCheck /> : <FaBan />}
                              {event.isDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(event)}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                              title="Delete Event"
                            >
                              <FaTrashAlt />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Ticket Types Detail */}
                      {isExpanded && event.ticketTypes && event.ticketTypes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaLayerGroup className="text-blue-600" />
                            Ticket Types ({event.ticketTypes.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {event.ticketTypes.map((ticket, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {ticket.name}
                                    </p>
                                    {ticket.description && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {ticket.description}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-sm font-bold text-green-700">
                                    {formatCurrency(ticket.price)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-500">
                                      <FaTicketAlt className="inline mr-1 text-gray-400" />
                                      {ticket.soldCount || 0} sold
                                    </span>
                                    {ticket.capacity > 0 && (
                                      <span className="text-gray-500">
                                        <FaUsers className="inline mr-1 text-gray-400" />
                                        {ticket.capacity} capacity
                                      </span>
                                    )}
                                  </div>
                                  {ticket.seatsPerTicket > 1 && (
                                    <span className="text-blue-600">
                                      {ticket.seatsPerTicket} seats/ticket
                                    </span>
                                  )}
                                </div>
                                {ticket.capacity > 0 && (
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                      <div
                                        className="bg-green-500 h-1 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            ((ticket.soldCount || 0) / ticket.capacity) * 100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {Math.round(
                                        ((ticket.soldCount || 0) / ticket.capacity) * 100
                                      )}% sold
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <p className="text-sm text-gray-600">
                  Showing {events.length} of {totalEvents} events
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:border-[#1B3766] hover:text-[#1B3766] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#1B3766] text-white shadow-md'
                            : 'border border-gray-300 text-gray-600 hover:border-[#1B3766] hover:text-[#1B3766]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:border-[#1B3766] hover:text-[#1B3766] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {eventToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEventToDelete(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrashAlt className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Event</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <strong>"{eventToDelete.title}"</strong>?
                  This will permanently remove the event and all associated registrations.
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEventToDelete(null)}
                    className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete Event'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Status Modal */}
        {eventToToggle && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEventToToggle(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    eventToToggle.isDisabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  {eventToToggle.isDisabled ? (
                    <FaCheck className="text-2xl text-green-600" />
                  ) : (
                    <FaBan className="text-2xl text-gray-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {eventToToggle.isDisabled ? 'Enable Event' : 'Disable Event'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {eventToToggle.isDisabled
                    ? `Are you sure you want to enable "${eventToToggle.title}"? This event will be visible to the public again.`
                    : `Are you sure you want to disable "${eventToToggle.title}"? This event will be hidden from public view${
                        eventToToggle.reportCount > 0
                          ? ` (${eventToToggle.reportCount} report${
                              eventToToggle.reportCount > 1 ? 's' : ''
                            })`
                          : ''
                      }.`}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEventToToggle(null)}
                    className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmToggle}
                    disabled={isToggling}
                    className={`flex-1 px-5 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      eventToToggle.isDisabled
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {isToggling ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </span>
                    ) : eventToToggle.isDisabled ? (
                      'Enable Event'
                    ) : (
                      'Disable Event'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminEvents;