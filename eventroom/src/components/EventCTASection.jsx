// components/EventCTASection.jsx – Combined CTA + Contact (Compact Grid)
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowRight,
  FaCalendarCheck,
  FaTicketAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const EventCTASection = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const getStartedLink = userInfo ? '/dashboard/events/new' : '/signup';
  const getStartedText = userInfo ? 'Create Your Event' : 'Start Hosting';

  return (
    <section
      id="contact"
      className="relative w-full py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f44]/95 via-[#0a1f44]/90 to-[#0a1f44]/95" />

      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* --- LEFT COLUMN: CTA --- */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <FaCalendarCheck className="text-cyan-300 text-xs" />
              <span className="text-white text-xs font-medium tracking-wide">
                Event Creator Tools
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Bring your event to life,{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                effortlessly
              </span>
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-sm sm:text-base mb-6 max-w-lg">
              Create, promote, and sell tickets in minutes. Keep{' '}
              <span className="text-cyan-300 font-bold">94%</span> of every sale —
              settled directly to your bank.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={getStartedLink}
                className="group bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-[#0a1f44] px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-cyan-400/30 inline-flex items-center gap-2"
              >
                {getStartedText}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
              </Link>
              <Link
                to="/all-events"
                className="group border-2 border-white/30 hover:border-white/60 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <FaTicketAlt className="text-cyan-300 text-xs" />
                Browse Events
              </Link>
            </div>

            {/* Mini feature hint (keeps it grounded) */}
            <div className="flex items-center gap-4 mt-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" /> Free to create
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" /> Secure payments
              </span>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Contact Details --- */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <FaMapMarkerAlt className="text-cyan-300 text-xs" />
              <span className="text-white text-xs font-medium tracking-wide">
                Get in Touch
              </span>
            </div>

            {/* Heading */}
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-5 leading-tight">
              Let's talk{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                today
              </span>
            </h3>

            {/* Contact Items */}
            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:growth@lovohcreate.com"
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-2xl p-4 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-cyan-300 text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">Email</p>
                  <p className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors">
                    growth@lovohcreate.com
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+2347059585905"
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-2xl p-4 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="text-cyan-300 text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">Phone</p>
                  <p className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors">
                    +234 705 958 5905
                  </p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-cyan-300 text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-medium">Address</p>
                  <p className="text-white text-sm font-medium">
                    3, Amode Close, Ikeja, Lagos
                  </p>
                </div>
              </div>
            </div>

            {/* Small extra link */}
            <p className="text-gray-500 text-xs mt-4 text-right">
              Prefer a call? We're here Mon–Fri, 9am–6pm WAT.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default EventCTASection;