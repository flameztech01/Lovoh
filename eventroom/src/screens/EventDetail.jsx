// screens/EventDetail.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaDollarSign, FaUsers,
  FaArrowLeft, FaSpinner, FaCheckCircle,
  FaCalendarDay, FaCalendarCheck, FaTag, FaLink, FaCheck,
  FaShare, FaTicketAlt, FaCopy, FaUser, FaMapPin, FaGlobe,
  FaStar, FaLayerGroup, FaChair, FaVideo, FaChevronLeft, FaChevronRight,
  FaTimes, FaDownload, FaSearchPlus, FaExpand,
  FaWifi, FaExclamationTriangle, FaPhone, FaEnvelope,
} from 'react-icons/fa';
import { useGetEventByIdQuery, useVerifyPaymentQuery } from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AllEventsNavbar from '../components/AllEventsNavbar';
import Footer from '../components/Footer';

// ==================== SUBDOMAIN & BASE URL HELPERS ====================
const getSubdomain = () => {
  const hostname = window.location.hostname;
  if (hostname === 'eventroom.lovohcreate.com') return 'events';
  if (hostname === 'biizzed.lovohcreate.com') return 'biizzed';
  if (hostname === 'uduua.lovohcreate.com') return 'uduua';
  return 'main';
};

const currentSubdomain = getSubdomain();

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'eventroom.lovohcreate.com') return 'https://eventroom.lovohcreate.com';
  if (hostname === 'biizzed.lovohcreate.com') return 'https://biizzed.lovohcreate.com';
  if (hostname === 'uduua.lovohcreate.com') return 'https://uduua.lovohcreate.com';
  return 'https://lovohcreate.com';
};

const getEventsListPath = () => '/';

const getEventRegisterPath = (slug) => `/${slug}/register`;

const toAbsoluteUrl = (url) => {
  if (!url) return `${getBaseUrl()}/logo.png`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${getBaseUrl()}${url}`;
  return `${getBaseUrl()}/${url}`;
};

// ==================== SKELETON COMPONENTS (unchanged) ====================
const ImageSkeleton = () => (
  <div className="relative w-full h-56 sm:h-80 md:h-96 overflow-hidden bg-gray-200 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-gray-300/40 to-transparent" />
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
      <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-xl mb-6 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 bg-gray-200 rounded mt-0.5" />
      <div className="space-y-1 flex-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 bg-gray-200 rounded mt-0.5" />
      <div className="space-y-1 flex-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="flex items-start gap-3 sm:col-span-2">
      <div className="w-5 h-5 bg-gray-200 rounded mt-0.5" />
      <div className="space-y-1 flex-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const ButtonSkeleton = () => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-pulse">
    <div className="flex-1 h-14 bg-gray-200 rounded-xl" />
    <div className="flex items-center gap-2 justify-center">
      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      <div className="h-10 w-24 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const ContentSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 w-48 bg-gray-200 rounded" />
    <div className="space-y-2">
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => {
  const isNetworkError = !error?.status || error?.status === 'FETCH_ERROR' || error?.error?.includes('fetch') || error?.error?.includes('network');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
          {isNetworkError ? (
            <FaWifi className="text-3xl text-red-400" />
          ) : (
            <FaExclamationTriangle className="text-3xl text-red-400" />
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isNetworkError ? 'Connection Issue' : 'Something Went Wrong'}
        </h2>

        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          {isNetworkError
            ? "We couldn't load this event. Please check your internet connection and try again."
            : "We encountered an error while loading this event. Our team has been notified."}
        </p>

        {error?.data?.message && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 px-3 py-2 rounded-lg inline-block">
            {error.data.message}
          </p>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1B3766] text-white rounded-xl font-semibold text-sm hover:bg-[#142952] transition-all shadow-md"
          >
            Try Again
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-3 font-medium">Need help? Contact support:</p>
          <div className="space-y-2">
            <a
              href="mailto:support@lovohcreate.com"
              className="flex items-center justify-center gap-2 text-sm text-[#1B3766] hover:underline"
            >
              <FaEnvelope className="text-xs" />
              support@lovohcreate.com
            </a>
            <a
              href="https://wa.me/2348058586759"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-green-600 hover:underline"
            >
              <FaPhone className="text-xs" />
              WhatsApp: 08058586759
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventDetail = () => {
  const { id } = useParams();   // this is the slug
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: event, isLoading, error, refetch } = useGetEventByIdQuery(id);

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

  useEffect(() => {
    if (!event) return;

    const baseUrl = getBaseUrl();
    const eventUrl = `${baseUrl}${window.location.pathname}${window.location.search}`;
    const imageUrl = toAbsoluteUrl(event.images?.[0]);
    const description = event.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Check out this event on EventRoom';

    document.title = `${event.title} | EventRoom`;

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
    addedTags.push(setMeta('description', description));
    addedTags.push(setMeta('og:type', 'website', true));
    addedTags.push(setMeta('og:site_name', 'EventRoom', true));
    addedTags.push(setMeta('og:title', event.title, true));
    addedTags.push(setMeta('og:description', description, true));
    addedTags.push(setMeta('og:image', imageUrl, true));
    addedTags.push(setMeta('og:image:width', '1200', true));
    addedTags.push(setMeta('og:image:height', '630', true));
    addedTags.push(setMeta('og:image:alt', event.title, true));
    addedTags.push(setMeta('og:url', eventUrl, true));
    addedTags.push(setMeta('og:locale', 'en_US', true));
    addedTags.push(setMeta('twitter:card', 'summary_large_image'));
    addedTags.push(setMeta('twitter:site', '@lovohcreate', true));
    addedTags.push(setMeta('twitter:title', event.title));
    addedTags.push(setMeta('twitter:description', description));
    addedTags.push(setMeta('twitter:image', imageUrl));
    addedTags.push(setMeta('twitter:image:alt', event.title));
    addedTags.push(setMeta('og:image:secure_url', imageUrl, true));

    return () => {
      addedTags.forEach(tag => {
        if (tag && tag.parentNode) tag.remove();
      });
      document.title = 'LovoCreate';
    };
  }, [event]);

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
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

  const getShareDetails = useCallback(() => {
    if (!event) return '';
    const date = formatDate(event.date);
    const time = formatTime(event.time);
    const venue = event.venue || event.location || 'TBD';
    const price = getPriceRange() || 'Free';
    return `📅 ${event.title}\n${date} · ${time}\n📍 ${venue}\n💵 ${price}`;
  }, [event]);

  const shareWithImage = async (imageUrl, title, bodyText, url) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${title?.replace(/[^a-z0-9]/gi,'_') || 'event'}_poster.jpg`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: bodyText,
          url,
        });
        return;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('File share not supported, falling back to text share', err);
      } else {
        return; // user cancelled
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text: bodyText, url });
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Sharing failed');
        }
      }
    } else {
      const fullText = `${bodyText}\n🔗 ${url}`;
      await navigator.clipboard.writeText(fullText);
      toast.success('Link copied to clipboard');
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    const imageUrl = toAbsoluteUrl(event.images?.[0]);
    const details = getShareDetails();
    const baseUrl = getBaseUrl();
    const eventUrl = `${baseUrl}${window.location.pathname}`;
    await shareWithImage(imageUrl, event.title, details, eventUrl);
  };

  const shareCurrentPoster = async () => {
    if (!event || !event.images?.length) return;
    const imageUrl = event.images[currentImageIndex];
    const details = getShareDetails();
    const baseUrl = getBaseUrl();
    const eventUrl = `${baseUrl}${window.location.pathname}`;
    await shareWithImage(imageUrl, event.title, details, eventUrl);
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${event?.title || 'event'}_poster.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Poster downloaded');
    } catch (err) {
      toast.error('Download failed – right-click to save');
    }
  };

  // ✅ UPDATED: copy the actual event page URL, not the OG endpoint
  const handleCopy = async () => {
    const url = window.location.href.split('?')[0]; // clean URL, no query params
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getEventStatus = () => {
    if (!event) return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle };
    if (event.isDisabled) return { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: FaCheckCircle };
    if (event.status === 'postponed') return { label: 'Postponed', color: 'bg-yellow-100 text-yellow-800', icon: FaCalendarDay };
    const isPast = new Date(event.date) < new Date();
    if (isPast || event.status === 'passed') return { label: 'Past Event', color: 'bg-gray-100 text-gray-600', icon: FaCalendarCheck };
    return { label: 'Upcoming', color: 'bg-green-100 text-green-800', icon: FaCalendarDay };
  };

  const formatTimeRange = (time, duration) => {
    const start = formatTime(time);
    if (!duration || !time) return start || 'TBD';
    const calcEnd = () => {
      const [h, m] = time.split(':');
      const startDate = new Date();
      startDate.setHours(parseInt(h), parseInt(m) || 0, 0, 0);
      let durMs = 0;
      const str = duration.toString().trim().toLowerCase();
      let mins = str.match(/^(\d+)\s*min/);
      let hrs = str.match(/^(\d+)\s*h/);
      if (mins) durMs = parseInt(mins[1]) * 60000;
      else if (hrs) durMs = parseInt(hrs[1]) * 3600000;
      else return null;
      return new Date(startDate.getTime() + durMs);
    };
    const endDate = calcEnd();
    const end = endDate ? endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
    return end ? `${start} — ${end}` : start || 'TBD';
  };

  const hasTicketTypes = event?.ticketTypes?.length > 0;
  const isPastEvent = event ? (new Date(event.date) < new Date() || event.status === 'passed') : false;
  const canRegister = !isPastEvent && !event?.isDisabled && event?.status !== 'postponed';
  const hasImages = event?.images?.length > 0;
  const timeRangeDisplay = event ? formatTimeRange(event.time, event.duration) : 'TBD';

  const nextImage = useCallback(() => {
    if (event?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  }, [event]);

  const prevImage = useCallback(() => {
    if (event?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  }, [event]);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextImage, prevImage]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getEventsListPath());
    }
  };

  // ==================== RENDER ====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24">
          <button className="flex items-center gap-2 text-gray-400 mb-6 text-sm">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ImageSkeleton />
            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-20 bg-gray-200 rounded-full" />
                <div className="h-7 w-24 bg-gray-200 rounded-full" />
                <div className="h-7 w-16 bg-gray-200 rounded-full" />
                <div className="h-7 w-28 bg-gray-200 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="h-8 w-1/2 bg-gray-200 rounded hidden sm:block" />
              </div>
              <DetailSkeleton />
              <ButtonSkeleton />
              <ContentSkeleton />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="pt-20 sm:pt-24">
          <ErrorState error={error} onRetry={refetch} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaCalendarAlt className="text-3xl text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-500 mb-6">This event may have been removed or doesn't exist.</p>
          <Link to={getEventsListPath()} className="inline-flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl">
            <FaArrowLeft /> Browse Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const status = getEventStatus();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 sm:pt-24">
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
          {hasImages && (
            <div className="relative">
              <div 
                onClick={openLightbox}
                role="button"
                tabIndex={0}
                className="relative w-full h-56 sm:h-80 md:h-96 overflow-hidden bg-gray-100 cursor-zoom-in group"
                aria-label="View full poster"
              >
                <img 
                  src={event.images[currentImageIndex]} 
                  alt={`${event.title} - Image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                
                <div className="absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                  <div className="bg-black/60 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <FaSearchPlus className="text-xs" /> View full poster
                  </div>
                </div>

                <div className="absolute top-3 right-3 sm:hidden z-10">
                  <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full">
                    <FaExpand className="text-sm" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden z-10">
                  <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <FaExpand className="text-[10px]" /> Tap to view full poster
                  </div>
                </div>

                {event.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                    >
                      <FaChevronLeft className="text-gray-700" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
                    >
                      <FaChevronRight className="text-gray-700" />
                    </button>
                  </>
                )}
                
                {event.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {event.images.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
                        }`} 
                      />
                    ))}
                  </div>
                )}

                {event.images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full z-10 hidden sm:block">
                    {currentImageIndex + 1} / {event.images.length}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-5 sm:p-8">
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

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {canRegister ? (
                <Link to={getEventRegisterPath(id)}
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
                <button onClick={handleShareEvent} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all">
                  <FaShare className="text-xs" /> Share
                </button>
              </div>
            </div>

            {event.registrationDeadline && canRegister && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 mb-6">
                <p className="text-sm text-yellow-800">⏰ Registration closes on <strong>{formatDate(event.registrationDeadline)}</strong></p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Event</h3>
              <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none
                prose-headings:text-gray-900 prose-a:text-[#1B3766] prose-strong:text-gray-900
                prose-img:rounded-lg prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>

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

      {lightboxOpen && hasImages && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl z-10"
            aria-label="Close lightbox"
          >
            <FaTimes />
          </button>

          <div 
            className="relative max-w-5xl max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={event.images[currentImageIndex]} 
              alt={`${event.title} poster`} 
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />

            {event.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition"
                >
                  <FaChevronLeft className="text-gray-700" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition"
                >
                  <FaChevronRight className="text-gray-700" />
                </button>
              </>
            )}

            {event.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {event.images.length}
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={() => downloadImage(event.images[currentImageIndex])}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 rounded-full font-medium hover:bg-gray-100 transition shadow-lg"
            >
              <FaDownload /> Download
            </button>
            <button
              onClick={shareCurrentPoster}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 rounded-full font-medium hover:bg-gray-100 transition shadow-lg"
            >
              <FaShare /> Share
            </button>
          </div>

          <div className="absolute bottom-20 text-white/50 text-xs text-center">
            Tap outside or press Esc to close
          </div>
        </div>
      )}

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