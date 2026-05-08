// components/EventCTASection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlus, FaArrowRight } from 'react-icons/fa';

const EventCTASection = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const getStartedLink = userInfo 
    ? '/events/dashboard/events/new' 
    : '/events/signup';

  const getStartedText = userInfo 
    ? 'Create Your Event' 
    : 'Sign Up to Create Events';

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-[#1B3766] rounded-3xl p-8 lg:p-12 text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Create Your Own Event?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Sign up in seconds with Google, set up your payment wallet, and start hosting paid or free events. 
            You keep 94% of every ticket sale — the rest is handled automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={getStartedLink}
              className="bg-[#79FFFF] hover:bg-[#a6fffe] text-[#1B3766] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group"
            >
              {userInfo ? (
                <>
                  <FaPlus className="text-sm" />
                  {getStartedText}
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                getStartedText
              )}
            </Link>
            <Link
              to="/events/all-events"
              className="border-2 border-white text-white hover:bg-white hover:text-[#1B3766] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Browse Events
              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            No hidden fees • Auto-settlement to your bank • Ticket generation included
          </p>
        </div>
      </div>
    </section>
  );
};

export default EventCTASection;