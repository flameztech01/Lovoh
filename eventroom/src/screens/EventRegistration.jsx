// screens/EventRegistration.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaCheckCircle, FaTicketAlt,
  FaDollarSign, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaPlus, FaMinus, FaTimes, FaUser, FaEnvelope, FaPhone,
  FaExclamationTriangle, FaLock, FaImage, FaDownload,
  FaUserCircle, FaPaintBrush, FaEye,
} from 'react-icons/fa';
import {
  useGetEventByIdQuery,
  useRegisterForEventMutation,
  useGetEventCustomFormQuery,
  useGeneratePosterMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AllEventsNavbar from '../components/AllEventsNavbar';
import Footer from '../components/Footer';

// ==================== HELPERS ====================
const isRegistrationOpen = (event) => {
  if (!event) return false;
  const now = new Date();
  const eventDateTime = new Date(event.date);
  const [hours, minutes] = (event.time || '00:00').split(':').map(Number);
  eventDateTime.setHours(hours, minutes, 0, 0);
  let deadlineDateTime;
  if (event.registrationDeadline) {
    deadlineDateTime = new Date(event.registrationDeadline);
    const deadlineDateOnly = new Date(deadlineDateTime);
    deadlineDateOnly.setHours(0, 0, 0, 0);
    const eventDateOnly = new Date(eventDateTime);
    eventDateOnly.setHours(0, 0, 0, 0);
    if (deadlineDateOnly.getTime() === eventDateOnly.getTime()) {
      deadlineDateTime = new Date(eventDateTime);
    } else {
      deadlineDateTime.setHours(23, 59, 59, 999);
    }
  } else {
    deadlineDateTime = new Date(eventDateTime);
  }
  const isEventPassed = now > eventDateTime;
  const isDeadlinePassed = now > deadlineDateTime;
  const isEventActive = event.status !== 'passed' && event.status !== 'cancelled' && event.status !== 'postponed';
  return !isEventPassed && !isDeadlinePassed && isEventActive && !event.isDisabled;
};

const isEventPassed = (event) => {
  if (!event) return true;
  if (event.status === 'passed' || event.status === 'cancelled' || event.status === 'postponed') return true;
  const now = new Date();
  const eventDateTime = new Date(event.date);
  const [hours, minutes] = (event.time || '00:00').split(':').map(Number);
  eventDateTime.setHours(hours, minutes, 0, 0);
  return now > eventDateTime;
};

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading, refetch } = useGetEventByIdQuery(id);
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  const [generatePoster, { isLoading: isGenerating }] = useGeneratePosterMutation();
  const { data: customFormResponse } = useGetEventCustomFormQuery(id);
  const customForm = customFormResponse?._id ? customFormResponse : null;

  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAttendeeFields, setShowAttendeeFields] = useState(false);
  const [additionalAttendees, setAdditionalAttendees] = useState([]);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [customFormResponses, setCustomFormResponses] = useState([]);

  // Poster state
  const [posterData, setPosterData] = useState(null);
  const [posterPhoto, setPosterPhoto] = useState(null);
  const [posterPhotoPreview, setPosterPhotoPreview] = useState('');
  const [posterName, setPosterName] = useState('');
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState(null);
  const [posterGenerating, setPosterGenerating] = useState(false);
  const [showPosterForm, setShowPosterForm] = useState(false);
  const fileInputRef = useRef(null);

  const hasTicketTypes = event?.ticketTypes?.length > 0;
  const selectedTicket = hasTicketTypes ? event.ticketTypes[selectedTicketIndex] : null;
  const ticketPrice = selectedTicket ? selectedTicket.price : (event?.price || 0);
  const totalAmount = ticketPrice * quantity;

  const registrationOpen = event ? isRegistrationOpen(event) : false;
  const canRegister = registrationOpen && !event?.isDisabled && event?.status !== 'postponed';

  const getRegistrationClosedReason = () => {
    if (!event) return 'Event not found';
    if (event.isDisabled) return 'Event has been cancelled';
    if (event.status === 'postponed') return 'Event has been postponed';
    if (isEventPassed(event)) return 'Event has already passed';
    if (event.registrationDeadline) {
      const now = new Date();
      const deadline = new Date(event.registrationDeadline);
      if (now > deadline) return 'Registration deadline has passed';
    }
    if (!registrationOpen && !isEventPassed(event)) {
      if (event.registrationDeadline) {
        const deadline = new Date(event.registrationDeadline);
        if (deadline.toDateString() === new Date(event.date).toDateString()) {
          return 'Registration closed when the event started';
        }
      }
      return 'Registration is currently closed';
    }
    return 'Registration is not available';
  };

  // Initialize custom form responses
  useEffect(() => {
    if (customForm && customForm.fields?.length > 0) {
      setCustomFormResponses(
        customForm.fields.map((field) => ({
          fieldId: field._id,
          label: field.label,
          value: field.type === 'checkbox' ? [] : '',
        }))
      );
    } else {
      setCustomFormResponses([]);
    }
  }, [customForm]);

  useEffect(() => {
    if (quantity > 1 && showAttendeeFields) {
      const currentCount = additionalAttendees.length;
      const needed = quantity - 1;
      if (currentCount < needed) {
        const newAttendees = [...additionalAttendees];
        for (let i = currentCount; i < needed; i++) {
          newAttendees.push({ name: '', email: '', phone: '' });
        }
        setAdditionalAttendees(newAttendees);
      } else if (currentCount > needed) {
        setAdditionalAttendees(additionalAttendees.slice(0, needed));
      }
    }
  }, [quantity, showAttendeeFields]);

  const updateAttendee = (index, field, value) => {
    const updated = [...additionalAttendees];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalAttendees(updated);
  };

  const handleCustomFormChange = (index, value, isCheckbox = false, isChecked = false) => {
    const updated = [...customFormResponses];
    if (isCheckbox) {
      const current = updated[index].value || [];
      if (isChecked) {
        updated[index] = { ...updated[index], value: [...current, value] };
      } else {
        updated[index] = { ...updated[index], value: current.filter(v => v !== value) };
      }
    } else {
      updated[index] = { ...updated[index], value };
    }
    setCustomFormResponses(updated);
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (time) => time || '';

  const formatPrice = (price) => {
    if (!price) return 'Free';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ========== POSTER HANDLERS ==========
  const handlePosterPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setPosterPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePosterPhoto = () => {
    setPosterPhoto(null);
    setPosterPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGeneratePoster = async () => {
    if (!posterPhoto && !posterPhotoPreview) {
      toast.error('Please upload a photo');
      return;
    }
    if (!posterName.trim()) {
      toast.error('Please enter your name for the poster');
      return;
    }

    setPosterGenerating(true);
    try {
      const formData = new FormData();
      if (posterPhoto) formData.append('photo', posterPhoto);
      formData.append('name', posterName.trim());

      const result = await generatePoster({
        id: event._id,
        registrationId: posterData.registration._id,
        formData,
      }).unwrap();

      setGeneratedPosterUrl(result.posterImage);
      toast.success('Poster generated successfully!');
      setPosterData(prev => ({
        ...prev,
        registration: { ...prev.registration, posterGenerated: true, posterImage: result.posterImage },
      }));
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to generate poster');
    } finally {
      setPosterGenerating(false);
    }
  };

  // FIXED: Download poster as a file (fetch blob, then download)
  const handleDownloadPoster = async () => {
    if (!generatedPosterUrl) return;
    try {
      const response = await fetch(generatedPosterUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster_${event.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab if fetch fails
      window.open(generatedPosterUrl, '_blank');
    }
  };

  // ========== REGISTRATION SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRegistrationOpen(event)) {
      toast.error('Registration is no longer open for this event');
      refetch();
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }

    if (customForm && customForm.fields) {
      for (let i = 0; i < customForm.fields.length; i++) {
        const field = customForm.fields[i];
        if (field.required) {
          const response = customFormResponses[i];
          const val = response?.value;
          if (
            val === undefined ||
            val === '' ||
            (Array.isArray(val) && val.length === 0)
          ) {
            toast.error(`"${field.label}" is required`);
            return;
          }
        }
      }
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone || '',
        ticketTypeIndex: hasTicketTypes ? selectedTicketIndex : 0,
        quantity,
        additionalAttendees: showAttendeeFields ? additionalAttendees.map(a => ({
          name: a.name.trim(),
          email: a.email?.trim() || '',
          phone: a.phone || '',
        })) : [],
        sendIndividualTickets: showAttendeeFields && additionalAttendees.some(a => a.email),
        customFormResponses: customFormResponses.length > 0 ? customFormResponses : undefined,
      };

      const result = await registerForEvent({
        id: event._id,
        data: payload,
      }).unwrap();

      if (event.isPaid && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        setRegistrationComplete(true);
        const hasPosterTemplate = event.posterTemplate && event.posterTemplate.image;
        if (hasPosterTemplate) {
          setPosterData({
            registration: result.registration,
            template: event.posterTemplate,
            canGenerate: true,
          });
          setPosterName(result.registration.name || '');
          setShowPosterForm(true);
          toast.success('Registration successful! Create your poster now!');
        } else {
          setPosterData(null);
          setShowPosterForm(false);
          toast.success('Registration successful! Check your email for your ticket(s).');
        }
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed.');
    }
  };

  // ========== LOADING / ERROR STATES ==========
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="flex justify-center items-center h-96 pt-20">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl">
            <FaArrowLeft /> Browse Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!canRegister) {
    const closedReason = getRegistrationClosedReason();
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <FaLock className="text-4xl text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Closed</h1>
            <p className="text-gray-600 mb-6">{closedReason}</p>
            <div className="space-y-3">
              <Link to={`/events/${id}`} className="block w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all">
                Back to Event
              </Link>
              <Link to="/" className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                Browse More Events
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ========== REGISTRATION COMPLETE – with inline poster ==========
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-4xl text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful! 🎉</h1>
              <p className="text-gray-600">
                Check your email for your ticket{quantity > 1 ? 's' : ''} and event details.
              </p>
            </div>

            {/* Poster section - visible if template exists */}
            {showPosterForm && posterData && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaPaintBrush className="text-2xl text-[#1B3766]" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {generatedPosterUrl ? 'Your Poster is Ready! 🎨' : 'Create Your "I\'m Attending" Poster'}
                  </h2>
                </div>

                {/* Poster Preview / Generated Poster */}
                <div className="relative bg-gray-50 rounded-xl p-4 mb-4 flex justify-center">
                  {generatedPosterUrl ? (
                    // Show generated poster
                    <img
                      src={generatedPosterUrl}
                      alt="Your poster"
                      className="max-w-full max-h-[400px] rounded-lg shadow-md object-contain"
                    />
                  ) : (
                    // Show empty template preview with placeholder overlay
                    <div className="relative w-full max-w-[400px]">
                      <img
                        src={posterData.template.image}
                        alt="Poster template"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      {/* Overlay placeholders */}
                      <div
                        className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 rounded flex items-center justify-center text-xs text-blue-600 font-medium"
                        style={{
                          left: `${(posterData.template.photoPlaceholder.x / 736) * 100}%`,
                          top: `${(posterData.template.photoPlaceholder.y / 736) * 100}%`,
                          width: `${(posterData.template.photoPlaceholder.width / 736) * 100}%`,
                          height: `${(posterData.template.photoPlaceholder.height / 736) * 100}%`,
                          borderRadius: `${posterData.template.photoPlaceholder.borderRadius || 0}px`,
                        }}
                      >
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">📷 Your Photo</span>
                      </div>
                      <div
                        className="absolute border-2 border-dashed border-green-500 bg-green-500/10 flex items-center justify-center text-xs text-green-700 font-bold"
                        style={{
                          left: `${(posterData.template.namePlaceholder.x / 736) * 100}%`,
                          top: `${(posterData.template.namePlaceholder.y / 736) * 100}%`,
                          fontSize: `${(posterData.template.namePlaceholder.fontSize / 736) * 100}vh`,
                          color: posterData.template.namePlaceholder.color,
                          fontFamily: posterData.template.namePlaceholder.fontFamily,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Your Name
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaEye className="text-[10px]" /> Preview
                      </div>
                    </div>
                  )}
                </div>

                {/* If not yet generated, show the form */}
                {!generatedPosterUrl && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Personalise your poster with your photo and name. Share it on social media!
                    </p>

                    {/* Photo upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Photo</label>
                      <div className="flex items-center gap-4">
                        {posterPhotoPreview ? (
                          <div className="relative group">
                            <img src={posterPhotoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-[#1B3766]" />
                            <button
                              type="button"
                              onClick={removePosterPhoto}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes className="text-[10px]" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                            <FaUserCircle className="text-4xl text-gray-400" />
                          </div>
                        )}
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            <FaImage className="text-xs" /> {posterPhotoPreview ? 'Change' : 'Upload Photo'}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePosterPhotoSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB)</p>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name on Poster</label>
                      <input
                        type="text"
                        value={posterName}
                        onChange={(e) => setPosterName(e.target.value)}
                        placeholder="Enter the name you want on the poster"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleGeneratePoster}
                        disabled={posterGenerating}
                        className="flex-1 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {posterGenerating ? <FaSpinner className="animate-spin" /> : <FaPaintBrush />}
                        {posterGenerating ? 'Generating...' : 'Generate Poster'}
                      </button>
                      <button
                        onClick={() => setShowPosterForm(false)}
                        className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Skip
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center">You can also generate your poster later from your dashboard.</p>
                  </div>
                )}

                {/* If generated, show download and close buttons */}
                {generatedPosterUrl && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleDownloadPoster}
                      className="flex-1 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all flex items-center justify-center gap-2"
                    >
                      <FaDownload /> Download Poster
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedPosterUrl(null);
                        setPosterData(null);
                        setShowPosterForm(false);
                      }}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-3">
              <Link to={`/events/${id}`} className="flex-1 py-3 bg-[#1B3766] text-white rounded-xl font-semibold text-center hover:bg-[#142952] transition-all">
                Back to Event
              </Link>
              <Link to="/" className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-all">
                Browse More Events
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ========== REGISTRATION FORM ==========
  return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><FaCalendarAlt className="text-xs" /> {formatDate(event.date)}</span>
            <span className="flex items-center gap-1"><FaClock className="text-xs" /> {formatTime(event.time)}</span>
            <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-xs" /> {event.venue || event.location}</span>
          </div>

          {event.registrationDeadline && new Date(event.registrationDeadline) > new Date() && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-yellow-700 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" />
                Registration closes on {formatDate(event.registrationDeadline)}
                {new Date(event.registrationDeadline).toDateString() === new Date(event.date).toDateString() && (
                  <span className="block text-xs text-yellow-600">(Closes when event starts)</span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaTicketAlt className="text-[#1B3766]" /> Complete Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ticket Type Selection */}
            {hasTicketTypes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ticket Type</label>
                <div className="space-y-2">
                  {event.ticketTypes.map((tt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTicketIndex(idx)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedTicketIndex === idx ? 'border-[#1B3766] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{tt.name}</span>
                        <span className="font-bold text-[#1B3766]">{formatPrice(tt.price)}</span>
                      </div>
                      {tt.description && <p className="text-xs text-gray-500 mt-0.5">{tt.description}</p>}
                      <div className="flex gap-3 text-xs text-gray-400 mt-1">
                        {tt.capacity > 0 && <span>{tt.soldCount}/{tt.capacity} sold</span>}
                        {tt.seatsPerTicket > 1 && <span>• {tt.seatsPerTicket} seats/ticket</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {event.enableMultipleTickets && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Tickets</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-[#1B3766] hover:text-[#1B3766] transition-all"
                  >
                    <FaMinus />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(event.maxTicketsPerOrder || 10, quantity + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-[#1B3766] hover:text-[#1B3766] transition-all"
                  >
                    <FaPlus />
                  </button>
                </div>
                {event.isPaid && <p className="text-lg font-bold text-[#1B3766] mt-3">Total: {formatPrice(totalAmount)}</p>}
              </div>
            )}

            {/* Primary Attendee */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaUser className="text-[#1B3766]" /> Your Information
              </h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name *"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address *"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  />
                </div>
              </div>
            </div>

            {/* Custom Registration Form */}
            {customForm && customForm.fields?.length > 0 && customForm.isActive !== false && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{customForm.title || 'Additional Information'}</h3>
                {customForm.description && (
                  <p className="text-xs text-gray-500 mb-4">{customForm.description}</p>
                )}
                <div className="space-y-4">
                  {customForm.fields.map((field, idx) => {
                    const resp = customFormResponses[idx];
                    const isReq = field.required;
                    const commProps = {
                      required: isReq,
                      className: `w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm`,
                      placeholder: field.placeholder || field.label + (isReq ? ' *' : ''),
                    };

                    return (
                      <div key={idx}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {isReq && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'text' && (
                          <input
                            type="text"
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <textarea
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                            rows={3}
                          />
                        )}
                        {field.type === 'number' && (
                          <input
                            type="number"
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                          />
                        )}
                        {field.type === 'email' && (
                          <input
                            type="email"
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                          />
                        )}
                        {field.type === 'phone' && (
                          <input
                            type="tel"
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                          />
                        )}
                        {field.type === 'date' && (
                          <input
                            type="date"
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                          />
                        )}
                        {field.type === 'dropdown' && (
                          <select
                            {...commProps}
                            value={resp?.value || ''}
                            onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {field.options?.map((opt, oi) => (
                              <option key={oi} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {field.type === 'checkbox' && (
                          <div className="space-y-2">
                            {field.options?.map((opt, oi) => (
                              <label key={oi} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="rounded text-[#1B3766] focus:ring-[#1B3766]"
                                  checked={resp?.value?.includes(opt) || false}
                                  onChange={(e) => handleCustomFormChange(idx, opt, true, e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {field.type === 'radio' && (
                          <div className="space-y-2">
                            {field.options?.map((opt, oi) => (
                              <label key={oi} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`custom-field-${idx}`}
                                  className="text-[#1B3766] focus:ring-[#1B3766]"
                                  value={opt}
                                  checked={resp?.value === opt}
                                  onChange={(e) => handleCustomFormChange(idx, e.target.value)}
                                />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Attendees Toggle */}
            {quantity > 1 && (
              <div className="border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAttendeeFields(!showAttendeeFields)}
                  className={`w-full py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-all ${
                    showAttendeeFields ? 'border-[#1B3766] text-[#1B3766] bg-blue-50' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {showAttendeeFields ? '✓ Hide' : '+'} Add names & emails of the other {quantity - 1} attendee{quantity > 2 ? 's' : ''} you're buying for?
                </button>

                {showAttendeeFields && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Additional Attendees</h3>
                    {additionalAttendees.map((att, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Attendee #{idx + 2}</p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={att.name}
                            onChange={(e) => updateAttendee(idx, 'name', e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                          />
                          <input
                            type="email"
                            value={att.email}
                            onChange={(e) => updateAttendee(idx, 'email', e.target.value)}
                            placeholder="Email (to receive ticket)"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Info */}
            {event.isPaid && totalAmount > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">Payment Summary</p>
                <p>{quantity} x {hasTicketTypes ? event.ticketTypes[selectedTicketIndex]?.name : 'General Admission'}</p>
                <p className="text-lg font-bold mt-1">Total: {formatPrice(totalAmount)}</p>
                <p className="text-xs mt-2">You'll be redirected to Paystack to complete payment securely.</p>
              </div>
            )}

            {/* Security Warning */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4 text-sm">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-amber-600 text-lg mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 mb-1">Security Alert</p>
                  <p className="text-amber-700">
                    Never submit passwords, PINs, credit card details (except via official payment gateway),
                    or other sensitive personal information through this registration form.
                    Legitimate event organizers will never ask for such information here.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-4 bg-[#1B3766] text-white rounded-xl font-bold text-lg hover:bg-[#142952] transition-all shadow-lg disabled:opacity-50"
            >
              {isRegistering ? 'Processing...' : event.isPaid ? `Proceed to Pay ${formatPrice(totalAmount)}` : 'Register for Free'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventRegistration;