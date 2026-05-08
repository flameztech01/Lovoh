// adminScreen/AdminEventDetail.jsx - Updated with proper backend alignment
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaTicketAlt,
  FaEdit,
  FaTrashAlt,
  FaVideo,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarWeek,
  FaCalendarDay,
  FaStar,
  FaExclamationTriangle,
  FaTag,
  FaGlobe,
  FaLayerGroup,
  FaUser,
  FaBan,
  FaCheck,
  FaHourglassHalf,
  FaInfoCircle,
  FaLink,
  FaMapPin,
  FaCalendarCheck,
} from 'react-icons/fa';
import { 
  useGetEventByIdQuery, 
  useDeleteEventMutation,
  useToggleEventStatusMutation 
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  
  const { data: event, isLoading, refetch } = useGetEventByIdQuery(id);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const [toggleEventStatus, { isLoading: isToggling }] = useToggleEventStatusMutation();

  // Format helpers
  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return time;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get event status
  const getEventStatus = () => {
    if (!event) return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: FaInfoCircle };
    
    if (event.isDisabled) {
      return { label: 'Disabled', color: 'bg-gray-100 text-gray-700', icon: FaBan };
    }
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
    }
    if (event.status === 'postponed') {
      return { label: 'Postponed', color: 'bg-yellow-100 text-yellow-800', icon: FaCalendarWeek };
    }
    
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (event.status === 'ongoing' && eventDate.toDateString() === now.toDateString()) {
      return { label: 'Ongoing', color: 'bg-blue-100 text-blue-800', icon: FaHourglassHalf };
    }
    if (eventDate < now) {
      return { label: 'Past', color: 'bg-gray-100 text-gray-600', icon: FaCalendarCheck };
    }
    return { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: FaCalendarDay };
  };

  // Calculate ticket stats
  const getTotalTicketsSold = () => {
    if (!event) return 0;
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + (t.soldCount || 0), 0);
    }
    return event.currentAttendees || 0;
  };

  const getTotalSeatsSold = () => {
    if (!event) return 0;
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + ((t.soldCount || 0) * (t.seatsPerTicket || 1)), 0);
    }
    return event.currentAttendees || 0;
  };

  const getTotalRevenue = () => {
    if (!event || !event.isPaid) return 0;
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, t) => sum + ((t.soldCount || 0) * t.price), 0);
    }
    return (event.currentAttendees || 0) * (event.price || 0);
  };

  const getPriceRange = () => {
    if (!event || !event.isPaid) return null;
    
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = event.ticketTypes.map(t => t.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      
      if (min === max) {
        return formatCurrency(min);
      }
      return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    
    return formatCurrency(event.price);
  };

  // Handlers
  const handleDelete = async () => {
    try {
      await deleteEvent(id).unwrap();
      toast.success('Event deleted successfully');
      navigate('/admin/events');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete event');
    }
    setShowDeleteConfirm(false);
  };

  const handleToggle = async () => {
    try {
      const result = await toggleEventStatus({
        id,
        data: {
          reason: event.isDisabled ? '' : 'Disabled by admin',
        },
      }).unwrap();
      toast.success(result.message);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update event status');
    }
    setShowToggleConfirm(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading event details...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  // Not found state
  if (!event) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FaInfoCircle className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-4">This event may have been deleted or doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/events')}
            className="px-5 py-2.5 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-colors"
          >
            Back to Events
          </button>
        </div>
      </AdminSidebar>
    );
  }

  const status = getEventStatus();
  const StatusIcon = status.icon;
  const totalTickets = getTotalTicketsSold();
  const totalSeats = getTotalSeatsSold();
  const totalRevenue = getTotalRevenue();
  const priceRange = getPriceRange();

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button 
            onClick={() => navigate('/admin/events')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] transition-colors text-sm"
          >
            <FaArrowLeft className="text-xs" />
            Back to Events
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowToggleConfirm(true)}
              disabled={isToggling}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm text-white ${
                event.isDisabled 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-500 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              {event.isDisabled ? <FaCheck className="text-xs" /> : <FaBan className="text-xs" />}
              <span className="hidden sm:inline">{event.isDisabled ? 'Enable' : 'Disable'}</span>
            </button>
            <button 
              onClick={() => navigate(`/admin/events/${id}/registrations`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <FaTicketAlt className="text-xs" />
              <span className="hidden sm:inline">Registrations</span>
            </button>
            <button 
              onClick={() => navigate(`/admin/events/edit/${id}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FaEdit className="text-xs" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
            >
              <FaTrashAlt className="text-xs" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Images Gallery */}
          {event.images && event.images.length > 0 && (
            <div>
              {/* Main Image */}
              <div className="w-full h-56 sm:h-72 md:h-96 overflow-hidden bg-gray-100">
                <img 
                  src={event.images[0]} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnails */}
              {event.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto border-t border-gray-100">
                  {event.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        idx === 0 ? 'border-[#1B3766]' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`${event.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Event Details */}
          <div className="p-5 sm:p-6 md:p-8">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="text-xs" />
                {status.label}
              </span>
              
              {event.featured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <FaStar className="text-xs" /> Featured
                </span>
              )}

              {event.isVirtual && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <FaVideo className="text-xs" /> Virtual Event
                </span>
              )}

              {event.isDisabled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <FaExclamationTriangle className="text-xs" /> Disabled
                  {event.disabledReason && ` - ${event.disabledReason}`}
                </span>
              )}
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                <FaTag className="text-xs" /> {event.eventType || 'N/A'}
              </span>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                {event.category || 'N/A'}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                event.isPaid && event.price > 0 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <FaDollarSign className="text-xs" /> {event.isPaid ? 'Paid' : 'Free'}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {event.title}
            </h1>

            {/* Creator Info */}
            {event.createdBy && (
              <div className="flex items-center gap-2 mb-6 text-sm">
                <span className="text-gray-500">Created by</span>
                {event.createdBy.profile ? (
                  <img 
                    src={event.createdBy.profile} 
                    alt="" 
                    className="w-6 h-6 rounded-full object-cover border border-gray-200" 
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-[10px] text-gray-500" />
                  </div>
                )}
                <span className="font-medium text-gray-700">
                  {event.createdBy.name || event.createdBy.email || 'Unknown'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  event.creatorType === 'admin' 
                    ? 'bg-[#1B3766]/10 text-[#1B3766]' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {event.creatorType === 'admin' ? 'Admin' : 'User'}
                </span>
                {event.paymentSplit && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {event.paymentSplit === 'full' ? 'Full Payment' : 'Split Payment (94/6)'}
                  </span>
                )}
              </div>
            )}
            
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-5 bg-gray-50 rounded-xl">
              <DetailItem icon={FaCalendarAlt} label="Date" value={formatDate(event.date)} />
              <DetailItem icon={FaClock} label="Time" value={formatTime(event.time)} />
              
              {event.duration && (
                <DetailItem icon={FaHourglassHalf} label="Duration" value={event.duration} />
              )}
              
              <DetailItem 
                icon={event.isVirtual ? FaVideo : FaMapPin} 
                label={event.isVirtual ? 'Platform' : 'Venue'} 
                value={event.venue || event.location || 'N/A'}
              />
              
              {!event.isVirtual && event.location && event.venue && event.location !== event.venue && (
                <DetailItem icon={FaGlobe} label="Location" value={event.location} />
              )}

              {event.isVirtual && event.meetingLink && (
                <DetailItem 
                  icon={FaLink} 
                  label="Meeting Link" 
                  value={event.meetingLink}
                  isLink
                />
              )}
              
              {event.registrationDeadline && (
                <DetailItem 
                  icon={FaCalendarCheck} 
                  label="Registration Deadline" 
                  value={formatDate(event.registrationDeadline)}
                />
              )}
              
              <DetailItem 
                icon={FaUsers} 
                label="Capacity" 
                value={event.maxAttendees > 0 ? `${event.maxAttendees} people` : 'Unlimited'}
              />
              
              <DetailItem 
                icon={FaTicketAlt} 
                label="Max Tickets Per Order" 
                value={event.enableMultipleTickets ? event.maxTicketsPerOrder : '1'}
              />
            </div>

            {/* Registration Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Tickets Sold</p>
                <p className="text-2xl font-bold text-blue-900">{totalTickets}</p>
                {totalSeats > totalTickets && (
                  <p className="text-xs text-blue-600 mt-1">{totalSeats} seats across {totalTickets} tickets</p>
                )}
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider mb-1">Confirmed Attendees</p>
                <p className="text-2xl font-bold text-green-900">{event.currentAttendees || 0}</p>
                {event.maxAttendees > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(((event.currentAttendees || 0) / event.maxAttendees) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {Math.round(((event.currentAttendees || 0) / event.maxAttendees) * 100)}% filled
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">
                  {event.isPaid ? 'Total Revenue' : 'Event Type'}
                </p>
                {event.isPaid ? (
                  <>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalRevenue)}</p>
                    {priceRange && (
                      <p className="text-xs text-purple-600 mt-1">Price range: {priceRange}</p>
                    )}
                  </>
                ) : (
                  <p className="text-2xl font-bold text-purple-900">Free Event</p>
                )}
              </div>
            </div>

            {/* Ticket Types Section */}
            {event.ticketTypes && event.ticketTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaLayerGroup className="text-[#1B3766]" />
                  Ticket Types ({event.ticketTypes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.ticketTypes.map((ticket, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                          {ticket.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{ticket.description}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-green-700">
                          {formatCurrency(ticket.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <FaTicketAlt className="text-gray-400" />
                          {ticket.soldCount || 0} sold
                        </span>
                        {ticket.capacity > 0 && (
                          <span className="flex items-center gap-1">
                            <FaUsers className="text-gray-400" />
                            {ticket.capacity} capacity
                          </span>
                        )}
                        {ticket.seatsPerTicket > 1 && (
                          <span className="text-blue-600 font-medium">
                            {ticket.seatsPerTicket} seats/ticket
                          </span>
                        )}
                      </div>
                      
                      {ticket.capacity > 0 && (
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(((ticket.soldCount || 0) / ticket.capacity) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(((ticket.soldCount || 0) / ticket.capacity) * 100)}% sold
                            {(ticket.soldCount || 0) >= ticket.capacity && (
                              <span className="text-red-600 ml-1">(Sold Out)</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaUser className="text-[#1B3766]" />
                  Speakers ({event.speakers.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {event.speakers.map((speaker, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {speaker.image ? (
                        <img 
                          src={speaker.image} 
                          alt={speaker.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-lg font-bold">
                          {(speaker.name || '?')[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{speaker.name}</p>
                        {(speaker.title || speaker.company) && (
                          <p className="text-xs text-gray-500">
                            {[speaker.title, speaker.company].filter(Boolean).join(' • ')}
                          </p>
                        )}
                        {speaker.bio && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{speaker.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs text-gray-500 mr-1">Tags:</span>
                {event.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Event</h3>
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none
                  prose-headings:text-gray-900 prose-a:text-[#1B3766] prose-strong:text-gray-900
                  prose-img:rounded-lg prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>

            {/* Reports Warning */}
            {event.reportCount > 0 && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <h3 className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-2">
                  <FaExclamationTriangle /> Report Information
                </h3>
                <p className="text-sm text-red-600">
                  This event has been reported <strong>{event.reportCount}</strong> time{event.reportCount > 1 ? 's' : ''}.
                  {event.isDisabled 
                    ? ' It has been automatically disabled due to multiple reports.' 
                    : ` It will be automatically disabled after ${5 - event.reportCount} more report${(5 - event.reportCount) > 1 ? 's' : ''}.`
                  }
                </p>
                {event.disabledReason && (
                  <p className="text-xs text-red-500 mt-1">
                    Disable reason: {event.disabledReason}
                  </p>
                )}
              </div>
            )}

            {/* Additional Metadata */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-500">
                <div>
                  <span className="block text-gray-400">Event ID</span>
                  <span className="font-mono">{event._id}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Created</span>
                  <span>{formatShortDate(event.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Last Updated</span>
                  <span>{formatShortDate(event.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Event</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{event.title}"</strong>?
                This will permanently remove the event and all associated registrations.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                  {isDeleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Modal */}
      {showToggleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowToggleConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                event.isDisabled ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {event.isDisabled ? (
                  <FaCheck className="text-2xl text-green-600" />
                ) : (
                  <FaBan className="text-2xl text-gray-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {event.isDisabled ? 'Enable Event' : 'Disable Event'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {event.isDisabled
                  ? `This will make "${event.title}" visible to the public again.`
                  : `This will hide "${event.title}" from public view${
                      event.reportCount > 0 ? ` (${event.reportCount} reports)` : ''
                    }.`
                }
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowToggleConfirm(false)}
                  className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleToggle} disabled={isToggling}
                  className={`flex-1 px-5 py-2.5 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    event.isDisabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}>
                  {isToggling ? 'Processing...' : event.isDisabled ? 'Enable Event' : 'Disable Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

// Detail Item Component
const DetailItem = ({ icon: Icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
      <Icon className="text-[#1B3766] text-sm" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</p>
      {isLink ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm text-[#1B3766] hover:underline font-medium break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-900 font-medium break-words">{value}</p>
      )}
    </div>
  </div>
);

export default AdminEventDetail;