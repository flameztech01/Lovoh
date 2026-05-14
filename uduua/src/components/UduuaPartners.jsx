// components/UduuaPartners.jsx
import React from 'react';

const UduuaPartners = () => {
  // Partner logos from public folder
  const logos = [
    { id: 1, src: '/logo1.png', alt: 'Partner 1' },
    { id: 2, src: '/logo2.png', alt: 'Partner 2' },
    { id: 3, src: '/logo3.png', alt: 'Partner 3' },
    { id: 4, src: '/logo4.png', alt: 'Partner 4' },
    { id: 5, src: '/logo5.png', alt: 'Partner 5' },
    { id: 6, src: '/logo6.png', alt: 'Partner 6' },
    { id: 7, src: '/logo7.png', alt: 'Partner 7' },
    { id: 8, src: '/logo8.png', alt: 'Partner 8' },
    { id: 9, src: '/logo9.png', alt: 'Partner 9' },
    { id: 10, src: '/logo10.png', alt: 'Partner 10' },
  ];

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-500 uppercase tracking-wider">
            Trusted Partners
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            Our Patnering Brands
          </p>
        </div>

        {/* Scrolling Logos Container */}
        <div className="relative overflow-hidden">
          {/* Gradient Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10"></div>

          {/* Animated Scroll Track */}
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex-shrink-0 w-32 sm:w-40 md:w-48 mx-4 sm:mx-6"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full h-20 object-contain filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-logo.png';
                  }}
                />
              </div>
            ))}
            {/* Duplicate set for seamless infinite scroll */}
            {logos.map((logo) => (
              <div
                key={`${logo.id}-duplicate`}
                className="flex-shrink-0 w-32 sm:w-40 md:w-48 mx-4 sm:mx-6"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full h-20 object-contain filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  onError={(e) => {
                    e.target.src = '/placeholder-logo.png';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          display: flex;
          animation: scroll 30s linear infinite;
          width: fit-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default UduuaPartners;