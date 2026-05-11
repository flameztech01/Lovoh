// screens/EventDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign, FaUsers,
  FaArrowLeft, FaSpinner, FaCheckCircle,
  FaCalendarDay, FaCalendarCheck, FaTag, FaLink, FaCheck,
  FaShare, FaTicketAlt, FaCopy, FaUser, FaMapPin, FaGlobe,
  FaStar, FaLayerGroup, FaChair, FaVideo, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { useGetEventByIdQuery, useVerifyPaymentQuery } from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AllEventsNavbar from '../components/AllEventsNavbar';
import Footer from '../components/Footer';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: event, isLoading, refetch } = useGetEventByIdQuery(id);

  const urlReference = searchParams.get('reference') || searchParams.get('trxref');
  const { data: verificationData, isFetching: isVerifying } = useVerifyPaymentQuery(
    urlReference, { skip: !urlReference || !!paymentStatus }
  );

  useEffect(() => {
    if (verificationData && urlReference && !paymentStatus) {
      setPaymentStatus('success');
      toast.success('Payment confirmed! Check your email for your ticket(s).');
      refetch();
      searchParams.delete('reference'); searchParams.delete('trxref');
      setSearchParams(searchParams, { replace: true });
    }
  }, [verificationData, urlReference, paymentStatus, refetch, searchParams, setSearchParams]);

  // ------------------------------------------------------------
  // Dynamic social meta tags – updates whenever event data loads
  // ------------------------------------------------------------
  useEffect(() => {
    if (!event) return;

    // Set page title
    document.title = `${event.title} | EventRoom`;

    // Helper to create or update a meta tag
    const setMeta = (nameOrProperty, content, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${nameOrProperty}"]`
        : `meta[name="${nameOrProperty}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) element.setAttribute('property', nameOrProperty);
        else element.setAttribute('name', nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
      return element;
    };

    const addedTags = [];

    addedTags.push(setMeta('description', event.description?.slice(0, 160)));
    addedTags.push(setMeta('og:title', event.title, true));
    addedTags.push(setMeta('og:description', event.description?.slice(0, 200), true));
    addedTags.push(setMeta('og:image', event.images?.[0] || '/logo.png', true));
    addedTags.push(setMeta('og:url', window.location.href, true));
    addedTags.push(setMeta('twitter:card', 'summary_large_image'));
    addedTags.push(setMeta('twitter:title', event.title));
    addedTags.push(setMeta('twitter:description', event.description?.slice(0, 200)));
    addedTags.push(setMeta('twitter:image', event.images?.[0] || '/logo.png'));

    // Cleanup: remove the tags we added when navigating away
    return () => {
      addedTags.forEach(tag => tag.remove());
      // Also remove the dynamic description meta if it matches the event
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta && descMeta.content === event.description?.slice(0, 160)) {
        descMeta.remove();
      }
      document.title = 'LovohCreate'; // restore default title (optional)
    };
  }, [event]);
  // ------------------------------------------------------------

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatShortDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes) || 0);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return time;
    }
  };

  const parseDuration = (duration) => {
    if (!duration) return null;
    
    const str = duration.toString().trim().toLowerCase();
    
    const minutesMatch = str.match(/^(\d+)\s*min(?:ute)?s?$/);
    if (minutesMatch) return { value: parseInt(minutesMatch[1]), unit: 'minutes' };
    
    const hoursMatch = str.match(/^(\d+)\s*h(?:ou)?r?s?$/);
    if (hoursMatch) return { value: parseInt(hoursMatch[1]), unit: 'hours' };
    
    const decimalMatch = str.match(/^(\d+\.?\d*)$/);
    if (decimalMatch) return { value: parseFloat(decimalMatch[1]), unit: 'hours' };
    
    const combinedMatch = str.match(/(\d+)\s*h(?:ou)?r?s?\s*(?:and\s*)?(\d+)?\s*min(?:ute)?s?/);
    if (combinedMatch) {
      const hours = parseInt(combinedMatch[1]) || 0;
      const minutes = parseInt(combinedMatch[2]) || 0;
      return { value: hours + (minutes / 60), unit: 'hours' };
    }
    
    return null;
  };

  const calculateEndTime = (time, duration) => {
    if (!time || !duration) return null;
    
    const parsed = parseDuration(duration);
    if (!parsed) return null;
    
    const [hours, minutes] = time.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes) || 0, 0, 0);
    
    let durationMs;
    if (parsed.unit === 'minutes') {
      durationMs = parsed.value * 60 * 1000;
    } else {
      durationMs = parsed.value * 60 * 60 * 1000;
    }
    
    const endDate = new Date(startDate.getTime() + durationMs);
    return endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatTimeRange = (time, duration) => {
    const startTime = formatTime(time);
    const endTime = calculateEndTime(time, duration);
    
    if (startTime && endTime) {
      return `${startTime} — ${endTime}`;
    }
    return startTime || 'TBD';
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const getEventStatus = () => {
    if (!event) return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle };
    if (event.isDisabled) return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaCheckCircle };
    if (event.status === 'postponed') return { label: 'Postponed', color: 'bg-yellow-100 text-yellow-800', icon: FaCalendarDay };
    const isPast = new Date(event.date) < new Date();
    if (isPast || event.status === 'passed') return { label: 'Past Event', color: 'bg-gray-100 text-gray-600', icon: FaCalendarCheck };
    return { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: FaCalendarDay };
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

  const hasTicketTypes = event?.ticketTypes?.length > 0;
  const totalSeats = (event?.currentAttendees) || 0;
  const isPastEvent = event ? (new Date(event.date) < new Date() || event.status === 'passed') : false;
  const canRegister = !isPastEvent && !event?.isDisabled && event?.status !== 'postponed';
  const hasImages = event?.images?.length > 0;
  const timeRangeDisplay = event ? formatTimeRange(event.time, event.duration) : 'TBD';

  const nextImage = () => {
    if (event?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = event?.title || 'Check out this event';
    if (navigator.share) {
      try { await navigator.share({ title, text: title, url }); }
      catch (err) { if (err.name !== 'AbortError') handleCopy(); }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true); toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      <div className="flex justify-center items-center h-96 pt-16">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading event...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
  
  if (!event) return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FaCalendarAlt className="text-3xl text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
        <p className="text-gray-500 mb-6">This event may have been removed or doesn't exist.</p>
        <Link to="/events" className="inline-flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl">
          <FaArrowLeft /> Browse Events
        </Link>
      </div>
      <Footer />
    </div>
  );

  const status = getEventStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24">
        <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-6 transition-colors text-sm group">
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Events
        </button>

        {/* Payment Verification */}
        {isVerifying && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 text-center mb-6">
            <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-800">Verifying your payment...</h3>
            <p className="text-blue-600 text-sm mt-1">Please wait a moment</p>
          </div>
        )}
        {paymentStatus === 'success' && (
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 text-center mb-6">
            <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful! 🎉</h3>
            <p className="text-green-600 text-sm">Your registration has been confirmed. Check your email for your ticket(s).</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Images Slider */}
          {hasImages && (
            <div className="relative">
              <div className="relative w-full h-56 sm:h-80 md:h-96 overflow-hidden bg-gray-100">
                <img 
                  src={event.images[currentImageIndex]} 
                  alt={`${event.title} - Image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                
                {event.images.length > 1 && (
                  <>
                    <button onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10">
                      <FaChevronLeft className="text-gray-700" />
                    </button>
                    <button onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10">
                      <FaChevronRight className="text-gray-700" />
                    </button>
                  </>
                )}
                
                {event.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {event.images.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
                        }`} />
                    ))}
                  </div>
                )}

                {event.images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10">
                    {currentImageIndex + 1} / {event.images.length}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-5 sm:p-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="text-xs" /> {status.label}
              </span>
              {event.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <FaStar className="text-xs" /> Featured
                </span>
              )}
              {event.isVirtual && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <FaVideo className="text-xs" /> Virtual Event
                </span>
              )}
              {!event.isPaid && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  <FaCheckCircle className="text-xs" /> Free
                </span>
              )}
              {event.isPaid && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <FaDollarSign className="text-xs" /> Paid
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                <FaTag className="text-xs" /> {event.eventType}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                {event.category}
              </span>
              {event.enableMultipleTickets && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                  <FaTicketAlt className="text-xs" /> Up to {event.maxTicketsPerOrder} tickets
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>

            {/* Details Grid - No Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-xl mb-6">
              <DetailItem icon={FaCalendarAlt} label="Date" value={formatDate(event.date)} />
              <DetailItem icon={FaClock} label="Time" value={timeRangeDisplay} />
              <DetailItem 
                icon={event.isVirtual ? FaVideo : FaMapPin} 
                label={event.isVirtual ? "Platform" : "Venue"} 
                value={event.venue || event.location || 'TBD'} 
                fullWidth 
              />
              {!event.isVirtual && event.location && event.location !== event.venue && (
                <DetailItem icon={FaMapMarkerAlt} label="City/Address" value={event.location} fullWidth />
              )}
              {event.isVirtual && event.meetingLink && (
                <DetailItem icon={FaLink} label="Meeting Link" value="Provided after registration" fullWidth />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {canRegister ? (
                <Link to={`/events/${id}/register`}
                  className="flex-1 py-3.5 bg-[#1B3766] text-white rounded-xl font-semibold text-lg hover:bg-[#142952] transition-all shadow-lg hover:shadow-xl text-center">
                  {event.isPaid 
                    ? `Register from ${hasTicketTypes ? formatPrice(Math.min(...event.ticketTypes.map(t => t.price))) : formatPrice(event.price)}` 
                    : 'Register for Free'
                  }
                </Link>
              ) : (
                <button disabled className="flex-1 py-3.5 bg-gray-300 text-gray-500 rounded-xl font-semibold text-lg cursor-not-allowed">
                  {isPastEvent ? 'Past Event — Registration Closed' : event.status === 'postponed' ? 'Event Postponed' : 'Registration Closed'}
                </button>
              )}
              <div className="flex items-center gap-2 justify-center">
                <button onClick={handleCopy} className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition" title="Copy link">
                  {copied ? <FaCheck className="text-green-500" /> : <FaLink />}
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all">
                  <FaShare className="text-xs" /> Share
                </button>
              </div>
            </div>

            {/* Registration Deadline Warning */}
            {event.registrationDeadline && canRegister && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 mb-6">
                <p className="text-sm text-yellow-800">⏰ Registration closes on <strong>{formatDate(event.registrationDeadline)}</strong></p>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Event</h3>
              <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none
                prose-headings:text-gray-900 prose-a:text-[#1B3766] prose-strong:text-gray-900
                prose-img:rounded-lg prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>

            {/* Ticket Types Detail */}
            {hasTicketTypes && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaLayerGroup className="text-[#1B3766]" /> Ticket Types
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {event.ticketTypes.map((tt, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#1B3766]/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900">{tt.name}</p>
                        <span className="font-bold text-[#1B3766]">{formatPrice(tt.price)}</span>
                      </div>
                      {tt.description && <p className="text-xs text-gray-500 mb-3">{tt.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {tt.seatsPerTicket > 1 && (
                          <span className="flex items-center gap-1">
                            <FaChair className="text-gray-400" /> {tt.seatsPerTicket} seats
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
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
                          <img src={speaker.image} alt={speaker.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
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
                        <p className="text-xs text-gray-600 leading-relaxed">{speaker.bio}</p>
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
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-default">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value, isLink, fullWidth }) => (
  <div className={`flex items-start gap-3 ${fullWidth ? 'sm:col-span-2' : ''}`}>
    <Icon className="text-[#1B3766] text-lg flex-shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1B3766] text-sm hover:underline break-all">
          {value}
        </a>
      ) : (
        <p className="font-semibold text-gray-900 text-sm break-words">{typeof value === 'string' ? value : value}</p>
      )}
    </div>
  </div>
);

export default EventDetail;