// components/EventAvatarSection.jsx – Avatar creation strip
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUserAstronaut, FaArrowRight } from 'react-icons/fa';

const EventAvatarSection = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const getStartedLink = userInfo ? '/dashboard/events/new' : '/signup';
  const getStartedText = userInfo ? 'Create Your Event Avatar' : 'Start Creating';

  return (
    <section
      id="avatar"
      className="relative w-full py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1535378917042-10a22c95931a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Dark overlay – lighter than CTA for variety */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f44]/90 via-[#0a1f44]/80 to-[#0a1f44]/90" />

      {/* Subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Icon / badge */}
        <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
          <FaUserAstronaut className="text-purple-300 text-sm" />
          <span className="text-white text-sm font-medium">Your Event Persona</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
          Create your{' '}
          <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
            event avatar
          </span>
        </h2>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-300 text-sm sm:text-base mb-8 leading-relaxed">
          Stand out with a custom avatar for your event profile.
          Let your guests recognise you before they even arrive.
        </p>

        {/* Button */}
        <Link
          to={getStartedLink}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-400 to-purple-300 hover:from-purple-300 hover:to-purple-200 text-[#0a1f44] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-400/30"
        >
          {getStartedText}
          <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Small footnote */}
        <p className="text-gray-500 text-xs mt-4">
          Start with a template or upload your own design.
        </p>
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

export default EventAvatarSection;