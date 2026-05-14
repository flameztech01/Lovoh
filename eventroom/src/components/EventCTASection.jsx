// components/EventCTASection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowRight, FaCalendarCheck, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';

const EventCTASection = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const getStartedLink = userInfo ? '/dashboard/events/new' : '/signup';
  const getStartedText = userInfo ? 'Create Your Event' : 'Start Hosting Events';

  return (
    <section className="relative w-full py-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f44]/95 via-[#0a1f44]/85 to-[#0a1f44]/90" />

      {/* Subtle animated overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Small badge */}
        <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
          <FaCalendarCheck className="text-cyan-300 text-sm" />
          <span className="text-white text-sm font-medium">Event Creator Tools</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
          Bring your event to life,{' '}
          <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            effortlessly
          </span>
        </h2>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg text-gray-300 mb-10">
          Create, promote, and sell tickets to your events in minutes. We handle payments, 
          you keep <span className="text-cyan-300 font-bold">94%</span> of every sale — settled directly to your bank.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            to={getStartedLink}
            className="group bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-[#0a1f44] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-400/30 inline-flex items-center gap-3"
          >
            {getStartedText}
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/all-events"
            className="group border-2 border-white/30 hover:border-white/80 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center gap-3"
          >
            <FaTicketAlt className="text-cyan-300" />
            Browse Events
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature highlights (replaces fake stats) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left sm:text-center">
          <div className="flex items-start sm:flex-col sm:items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaCalendarCheck className="text-cyan-300 text-lg" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Free to Create</h3>
              <p className="text-gray-400 text-sm">No upfront costs — only pay when you sell tickets.</p>
            </div>
          </div>

          <div className="flex items-start sm:flex-col sm:items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaTicketAlt className="text-cyan-300 text-lg" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Sell Tickets in Seconds</h3>
              <p className="text-gray-400 text-sm">Share a link, and we'll handle registration and payment.</p>
            </div>
          </div>

          <div className="flex items-start sm:flex-col sm:items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaShieldAlt className="text-cyan-300 text-lg" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Secure & Automated</h3>
              <p className="text-gray-400 text-sm">Funds settle directly to your bank. No middlemen.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple CSS animation for subtle glow */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default EventCTASection;