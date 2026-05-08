// screens/ContactUsScreen.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'react-toastify';
import { useSubmitFormMutation } from '../slices/formApiSlice';
import { FiCalendar, FiClock, FiMessageCircle, FiCheckCircle, FiArrowRight, FiZap } from 'react-icons/fi';

const ContactUsScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    sessionDate: '',
    sessionTime: '',
    message: ''
  });

  const [submitForm, { isLoading }] = useSubmitFormMutation();

  // Generate time slots from 9 AM to 5 PM with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${displayHour}:00 ${ampm}`);
      if (hour < 17) {
        slots.push(`${displayHour}:30 ${ampm}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get tomorrow's date as minimum date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get date 30 days from now as max date
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sessionDate || !formData.sessionTime) {
      toast.error('Please select your preferred date and time for the Clarity Session');
      return;
    }

    try {
      await submitForm({
        formType: 'clarity',
        formName: 'Clarity Session Booking',
        submittedFrom: 'Contact Us Page',
        pageUrl: window.location.pathname,
        contactInfo: {
          name: formData.name,
          email: formData.email,
          company: formData.company
        },
        formData: {
          sessionDateTime: {
            date: formData.sessionDate,
            time: formData.sessionTime
          },
          additionalInfo: formData.message
        }
      }).unwrap();

      toast.success("Clarity Session booked! We'll confirm your appointment within 2 hours.");
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        sessionDate: '',
        sessionTime: '',
        message: ''
      });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to book session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-[#254899] via-[#1a3480] to-[#0f2166] pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/30 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
              <span className="text-[#ebed17] font-semibold text-sm uppercase tracking-wider">
                Free 30-Minute Call
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Book Your Clarity Session
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A structured conversation to understand your goals, challenges, 
              and recommend the best path forward for your brand.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
              <div className="flex items-center gap-2 text-white/80">
                <FiClock className="w-5 h-5 text-[#ebed17]" />
                <span>30 Minutes</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <FiMessageCircle className="w-5 h-5 text-[#ebed17]" />
                <span>No pitch, just clarity</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <FiCheckCircle className="w-5 h-5 text-[#ebed17]" />
                <span>100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form & Info Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Booking Form */}
            <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Schedule Your Session</h2>
              <p className="text-gray-600 mb-5 text-sm">Pick a time that works for you</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254899] focus:border-transparent transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254899] focus:border-transparent transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254899] focus:border-transparent transition-all duration-200"
                    placeholder="Your company name"
                  />
                </div>

                {/* Date & Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <FiCalendar className="inline w-4 h-4 mr-1" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="sessionDate"
                      value={formData.sessionDate}
                      onChange={handleChange}
                      required
                      min={getTomorrowDate()}
                      max={getMaxDate()}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254899] focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      <FiClock className="inline w-4 h-4 mr-1" />
                      Preferred Time *
                    </label>
                    <select
                      name="sessionTime"
                      value={formData.sessionTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254899] focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500 -mt-3">
                  Business hours: 9:00 AM - 5:00 PM, Monday - Friday
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Additional Information
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#254899] focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Anything specific you'd like to discuss? (Optional)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#254899] hover:bg-[#1a3480] text-white py-3.5 rounded-xl font-bold text-base transition-all duration-300 transform hover:scale-[1.01] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Booking...' : 'Book Your Clarity Session'}
                </button>

                <p className="text-center text-gray-500 text-xs">
                  We'll send a calendar invitation within 2 hours
                </p>
              </form>
            </div>

            {/* Information Sidebar */}
            <div className="space-y-6">
              {/* What is a Clarity Session - WITH START PROJECT BUTTON INSIDE */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What is a Clarity Session?</h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                  A Clarity Session is a free 30-minute structured conversation designed to:
                </p>

                <ul className="space-y-3 mb-5">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-gray-700 text-sm">Understand your current situation and goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-gray-700 text-sm">Identify challenges holding your brand back</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-gray-700 text-sm">Recommend the best package for your needs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-gray-700 text-sm">Provide clear next steps — no hard sell</span>
                  </li>
                </ul>

                {/* Start Project Button Inside This Box */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-600 text-xs mb-3">
                    Already know what you need? Skip the call and tell us about your project directly.
                  </p>
                  <Link
                    to="/start-project"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-gradient-to-r from-[#254899] to-[#1a3480] text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 text-sm"
                  >
                    <FiZap className="w-4 h-4" />
                    <span>Start Your Project</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-gradient-to-r from-[#254899] to-[#1a3480] rounded-3xl p-7 text-white">
                <h3 className="text-xl font-bold mb-4">What happens next?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#ebed17] rounded-full flex items-center justify-center text-[#254899] text-xs font-bold">1</div>
                    <span className="text-white/90 text-sm">We'll confirm your session within 2 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#ebed17] rounded-full flex items-center justify-center text-[#254899] text-xs font-bold">2</div>
                    <span className="text-white/90 text-sm">Calendar invite sent to your email</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#ebed17] rounded-full flex items-center justify-center text-[#254899] text-xs font-bold">3</div>
                    <span className="text-white/90 text-sm">30-min clarity call at your chosen time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#ebed17] rounded-full flex items-center justify-center text-[#254899] text-xs font-bold">4</div>
                    <span className="text-white/90 text-sm">Leave with a clear roadmap forward</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Prefer to reach out directly?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#ebed17] rounded-xl flex items-center justify-center text-[#254899] flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Email Us</h4>
                      <p className="text-gray-600 text-sm">growth@lovohcreate.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#254899] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Call Us</h4>
                      <p className="text-gray-600 text-sm">+2347059585905</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactUsScreen;