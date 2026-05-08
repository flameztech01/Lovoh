// screens/EventDashboardEventDetail.jsx - Full details with speakers
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaDollarSign, FaUsers, FaEdit, FaTicketAlt, FaSpinner,
  FaCheckCircle, FaTimesCircle, FaCalendarDay, FaCalendarCheck,
  FaTag, FaShare, FaCheck, FaExclamationTriangle, FaBan,
  FaTrashAlt, FaChartBar, FaCopy, FaChair, FaUser,
  FaMapPin, FaGlobe, FaLink, FaLayerGroup, FaStar,
} from 'react-icons/fa';
import { 
  useGetEventByIdQuery, 
  useDeleteEventMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading } = useGetEventByIdQuery(id);
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatShortDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (time) => time || '';

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const getEventStatus = () => {
    if (!event) return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle };
    if (event.isDisabled) return { label: 'Disabled', color: 'bg-gray-100 text-gray-700', icon: FaBan };
    if (event.status === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
    if (event.status === 'postponed') return { label: 'Postponed', color: 'bg-yellow-100 text-yellow-800', icon: FaCalendarDay };
    return new Date(event.date) < new Date() 
      ? { label: 'Past', color: 'bg-gray-100 text-gray-600', icon: FaCalendarCheck }
      : { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: FaCalendarDay };
  };

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
      if (min === max) return formatPrice(min);
      return `${formatPrice(min)} - ${formatPrice(max)}`;
    }
    return formatPrice(event.price);
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(id).unwrap();
      toast.success('Event deleted');
      navigate('/events/dashboard/events');
    } catch (error) {
      toast.error(error?.data?.message || 'Delete failed');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${id}`;
    const title = event?.title || 'Check out this event';
    if (navigator.share) {
      try { await navigator.share({ title, text: title, url }); } 
      catch (err) { if (err.name !== 'AbortError') handleCopy(); }
    } else { handleCopy(); }
  };

  const handleCopy = async () => {
    const url = `${window.location.origin}/events/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getPublicLink = () => `${window.location.origin}/events/${id}`;

  const hasTicketTypes = event?.ticketTypes && event.ticketTypes.length > 0;
  const totalTickets = getTotalTicketsSold();
  const totalSeats = getTotalSeatsSold();
  const totalRevenue = getTotalRevenue();
  const priceRange = getPriceRange();

  if (isLoading) return (<EventDashboardSidebar><div className="flex justify-center items-center h-96"><FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" /></div></EventDashboardSidebar>);
  if (!event) return (<EventDashboardSidebar><div className="text-center py-20"><div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"><FaCalendarAlt className="text-3xl text-gray-400" /></div><h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1><Link to="/events/dashboard/events" className="inline-flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl"><FaArrowLeft /> Back to My Events</Link></div></EventDashboardSidebar>);

  const status = getEventStatus();
  const StatusIcon = status.icon;

  return (
    <EventDashboardSidebar>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button onClick={() => navigate('/events/dashboard/events')} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] transition-colors text-sm group">
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to My Events
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/events/dashboard/events/${id}/edit`)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"><FaEdit className="text-xs" /> Edit</button>
          <button onClick={() => navigate(`/events/dashboard/events/${id}/registrations`)} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"><FaTicketAlt className="text-xs" /> Registrations ({totalTickets})</button>
          <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"><FaTrashAlt className="text-xs" /> Delete</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Images */}
        {event.images?.length > 0 && (
          <div className="relative">
            <img src={event.images[0]} alt={event.title} className="w-full h-56 sm:h-72 md:h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {event.images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {event.images.map((img, idx) => (<img key={idx} src={img} alt="" className={`w-16 h-12 rounded-lg object-cover border-2 flex-shrink-0 ${idx === 0 ? 'border-white' : 'border-white/40'}`} />))}
              </div>
            )}
          </div>
        )}

        <div className="p-5 sm:p-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}><StatusIcon className="text-xs" /> {status.label}</span>
            {event.featured && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"><FaStar className="text-xs" /> Featured</span>}
            {event.isVirtual && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"><FaGlobe className="text-xs" /> Virtual</span>}
            {event.isPaid && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"><FaDollarSign className="text-xs" /> Paid</span>}
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"><FaTag className="text-xs" /> {event.eventType}</span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{event.category}</span>
            {event.enableMultipleTickets && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"><FaTicketAlt className="text-xs" /> Multi-buy ({event.maxTicketsPerOrder})</span>}
            {event.reportCount > 0 && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-medium"><FaExclamationTriangle className="text-xs" /> {event.reportCount}</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-gray-50 rounded-xl mb-6">
            <DetailItem icon={FaCalendarAlt} label="Date" value={formatDate(event.date)} />
            <DetailItem icon={FaClock} label="Time" value={formatTime(event.time) || 'TBD'} />
            {event.duration && <DetailItem icon={FaClock} label="Duration" value={event.duration} />}
            <DetailItem icon={event.isVirtual ? FaGlobe : FaMapPin} label={event.isVirtual ? "Platform" : "Venue"} value={event.venue || event.location || 'TBD'} />
            {!event.isVirtual && event.location && event.location !== event.venue && <DetailItem icon={FaMapMarkerAlt} label="City" value={event.location} />}
            {event.isVirtual && event.meetingLink && <DetailItem icon={FaLink} label="Meeting Link" value={event.meetingLink} isLink />}
            
            {/* Pricing */}
            {event.isPaid ? (
              <DetailItem icon={FaDollarSign} label="Pricing" value={hasTicketTypes ? priceRange : formatPrice(event.price)} />
            ) : (
              <DetailItem icon={FaDollarSign} label="Price" value="Free" />
            )}

            {/* Registrations */}
            <DetailItem icon={FaUsers} label="Registrations" value={
              <span>
                {totalTickets} tickets
                {totalSeats > totalTickets && <span className="text-gray-400 text-xs"> ({totalSeats} seats)</span>}
                {event.maxAttendees > 0 && <span> / {event.maxAttendees} capacity</span>}
              </span>
            } />
            
            {hasTicketTypes && (
              <DetailItem icon={FaLayerGroup} label="Ticket Types" value={`${event.ticketTypes.length} types`} />
            )}
            
            {event.enableMultipleTickets && (
              <DetailItem icon={FaTicketAlt} label="Max Per Order" value={event.maxTicketsPerOrder} />
            )}

            {event.registrationDeadline && (
              <DetailItem icon={FaCalendarAlt} label="Registration Deadline" value={formatDate(event.registrationDeadline)} />
            )}
          </div>

          {/* Capacity Bar */}
          {event.maxAttendees > 0 && (
            <div className="mb-6 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Capacity</span>
                <span className="text-sm text-gray-500">{totalSeats} / {event.maxAttendees} seats filled</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all" 
                  style={{ width: `${Math.min((totalSeats / event.maxAttendees) * 100, 100)}%` }} />
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Tickets Sold</p>
              <p className="text-2xl font-bold text-blue-900">{totalTickets}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Attendees</p>
              <p className="text-2xl font-bold text-green-900">{event.currentAttendees || 0}</p>
            </div>
            {event.isPaid && (
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-purple-900">{formatPrice(totalRevenue)}</p>
              </div>
            )}
          </div>

          {/* Ticket Types Detail */}
          {hasTicketTypes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaLayerGroup className="text-[#1B3766]" /> Ticket Types ({event.ticketTypes.length})</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {event.ticketTypes.map((tt, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-gray-900">{tt.name}</p>
                      <span className="font-bold text-green-700">{formatPrice(tt.price)}</span>
                    </div>
                    {tt.description && <p className="text-xs text-gray-500 mb-2">{tt.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span><FaTicketAlt className="inline text-gray-400 mr-1" />{tt.soldCount || 0} sold</span>
                      {tt.capacity > 0 && <span><FaUsers className="inline text-gray-400 mr-1" />{tt.capacity} cap</span>}
                      {tt.seatsPerTicket > 1 && <span className="text-blue-600">{tt.seatsPerTicket} seats</span>}
                    </div>
                    {tt.capacity > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(((tt.soldCount || 0) / tt.capacity) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public Link & Share */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Public Event Link</p>
              <p className="text-sm text-gray-700 truncate">{getPublicLink()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors flex-shrink-0">
                {copied ? <FaCheck className="text-green-500 text-xs" /> : <FaCopy className="text-xs" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm hover:bg-[#142952] transition-colors flex-shrink-0">
                <FaShare className="text-xs" /> Share
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Event</h3>
            <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>

          {/* Speakers - FULL DETAILS */}
          {event.speakers?.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-[#1B3766]" /> Speakers ({event.speakers.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.speakers.map((speaker, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      {speaker.image ? (
                        <img src={speaker.image} alt={speaker.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                          {(speaker.name || '?')[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{speaker.name}</h4>
                        {(speaker.title || speaker.company) && (
                          <p className="text-xs text-gray-500 truncate">
                            {[speaker.title, speaker.company].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                    {speaker.bio && (
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{speaker.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <p className="text-xs text-gray-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(event.tags) ? event.tags : event.tags.split(',')).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Registration Deadline Warning */}
          {event.registrationDeadline && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm text-yellow-800">⏰ Registration deadline: <strong>{formatDate(event.registrationDeadline)}</strong></p>
              </div>
            </div>
          )}

          {/* Revenue Summary */}
          {event.isPaid && totalRevenue > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaChartBar className="text-[#1B3766]" /> Revenue Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Tickets Sold</p>
                  <p className="text-xl font-bold text-green-700">{totalTickets}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Gross Revenue</p>
                  <p className="text-xl font-bold text-blue-700">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Your Share (94%)</p>
                  <p className="text-xl font-bold text-yellow-700">{formatPrice(totalRevenue * 0.94)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><FaTrashAlt className="text-2xl text-red-600" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Event</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong>"{event.title}"</strong>? This will permanently remove the event and all associated registrations. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                  {isDeleting ? <><FaSpinner className="animate-spin inline mr-1" /> Deleting...</> : 'Delete Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </EventDashboardSidebar>
  );
};

const DetailItem = ({ icon: Icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <Icon className="text-[#1B3766] text-lg flex-shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1B3766] text-sm hover:underline break-all">{value}</a>
      ) : (
        <p className="font-semibold text-gray-900 text-sm break-words">{typeof value === 'string' ? value : value}</p>
      )}
    </div>
  </div>
);

export default EventDashboardEventDetail;