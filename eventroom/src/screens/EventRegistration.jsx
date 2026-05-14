// screens/EventRegistration.jsx - With custom registration form
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaCheckCircle, FaTicketAlt,
  FaDollarSign, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaPlus, FaMinus, FaTimes, FaUser, FaEnvelope, FaPhone,
} from 'react-icons/fa';
import { useGetEventByIdQuery, useRegisterForEventMutation, useGetEventCustomFormQuery } from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AllEventsNavbar from '../components/AllEventsNavbar';
import Footer from '../components/Footer';

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading } = useGetEventByIdQuery(id);
  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  
  // Fetch custom form
  const { data: customFormResponse } = useGetEventCustomFormQuery(id);
  const customForm = customFormResponse?._id ? customFormResponse : null; // only treat as valid if it has _id

  const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAttendeeFields, setShowAttendeeFields] = useState(false);
  const [additionalAttendees, setAdditionalAttendees] = useState([]);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [customFormResponses, setCustomFormResponses] = useState([]);

  const hasTicketTypes = event?.ticketTypes?.length > 0;
  const selectedTicket = hasTicketTypes ? event.ticketTypes[selectedTicketIndex] : null;
  const ticketPrice = selectedTicket ? selectedTicket.price : (event?.price || 0);
  const totalAmount = ticketPrice * quantity;
  const canRegister = event && !event.isDisabled && new Date(event.date) >= new Date();

  // Initialize custom form responses
  useEffect(() => {
    if (customForm && customForm.fields?.length > 0) {
      setCustomFormResponses(
        customForm.fields.map((field) => ({
          fieldId: field._id,
          label: field.label,
          value: field.type === 'checkbox' ? [] : '', // use array for multi-select checkbox
        }))
      );
    } else {
      setCustomFormResponses([]);
    }
  }, [customForm]);

  // Update additional attendees when quantity changes
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

  // Custom form field change handler
  const handleCustomFormChange = (index, value, isCheckbox = false, isChecked = false) => {
    const updated = [...customFormResponses];
    if (isCheckbox) {
      // For checkbox type, value is an array of selected options
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }

    // Validate custom form required fields
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
        // Include custom form responses if any fields exist
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
        toast.success('Registration successful! Check your email for your ticket(s).');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Registration failed.');
    }
  };

  if (isLoading) return (<div className="min-h-screen bg-gray-50"><AllEventsNavbar /><div className="flex justify-center items-center h-96 pt-20"><FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" /></div><Footer /></div>);
  if (!event) return (<div className="min-h-screen bg-gray-50"><AllEventsNavbar /><div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center"><h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1><Link to="/" className="inline-flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl"><FaArrowLeft /> Browse Events</Link></div><Footer /></div>);
  if (!canRegister) return (<div className="min-h-screen bg-gray-50"><AllEventsNavbar /><div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center"><h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Closed</h1><p className="text-gray-600 mb-6">This event is no longer accepting registrations.</p><Link to={`/${id}`} className="inline-flex items-center gap-2 px-6 py-2 bg-[#1B3766] text-white rounded-xl"><FaArrowLeft /> Back to Event</Link></div><Footer /></div>);

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-md mx-auto px-4 py-20 pt-24 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful! 🎉</h1>
            <p className="text-gray-600 mb-6">Check your email for your ticket{quantity > 1 ? 's' : ''} and event details.</p>
            <div className="space-y-3">
              <Link to={`/${id}`} className="block w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all">Back to Event</Link>
              <Link to="/" className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">Browse More Events</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
        {/* <button onClick={() => navigate(`/${id}`)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-6 transition-colors text-sm group">
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to Event
        </button> */}

        {/* Event Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><FaCalendarAlt className="text-xs" /> {formatDate(event.date)}</span>
            <span className="flex items-center gap-1"><FaClock className="text-xs" /> {formatTime(event.time)}</span>
            <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-xs" /> {event.venue || event.location}</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FaTicketAlt className="text-[#1B3766]" /> Complete Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ticket Type Selection */}
            {hasTicketTypes && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Ticket Type</label>
                <div className="space-y-2">
                  {event.ticketTypes.map((tt, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedTicketIndex(idx)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedTicketIndex === idx ? 'border-[#1B3766] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
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
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-[#1B3766] hover:text-[#1B3766] transition-all"><FaMinus /></button>
                  <span className="text-2xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(event.maxTicketsPerOrder || 10, quantity + 1))} className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-[#1B3766] hover:text-[#1B3766] transition-all"><FaPlus /></button>
                </div>
                {event.isPaid && <p className="text-lg font-bold text-[#1B3766] mt-3">Total: {formatPrice(totalAmount)}</p>}
              </div>
            )}

            {/* Primary Attendee */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaUser className="text-[#1B3766]" /> Your Information</h3>
              <div className="space-y-3">
                <div><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name *" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                <div><input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address *" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                <div><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number (Optional)" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
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
                <button type="button" onClick={() => setShowAttendeeFields(!showAttendeeFields)}
                  className={`w-full py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-all ${
                    showAttendeeFields ? 'border-[#1B3766] text-[#1B3766] bg-blue-50' : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}>
                  {showAttendeeFields ? '✓' : '+'} Add names & emails of the other {quantity - 1} attendee{quantity > 2 ? 's' : ''} you're buying for?
                </button>

                {showAttendeeFields && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Additional Attendees</h3>
                    {additionalAttendees.map((att, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Attendee #{idx + 2}</p>
                        <div className="space-y-2">
                          <input type="text" value={att.name} onChange={(e) => updateAttendee(idx, 'name', e.target.value)} placeholder="Full Name" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                          <input type="email" value={att.email} onChange={(e) => updateAttendee(idx, 'email', e.target.value)} placeholder="Email (to receive ticket)" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
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

            <button type="submit" disabled={isRegistering}
              className="w-full py-4 bg-[#1B3766] text-white rounded-xl font-bold text-lg hover:bg-[#142952] transition-all shadow-lg disabled:opacity-50">
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