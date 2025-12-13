// components/services/ServicesHero.jsx
import React, { useEffect, useState } from 'react';

const Servicepagehero = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const services = [
    "Brand Dev", "Digital Strategy", "UI/UX", "Web Dev", 
    "App Dev", "Marketing", "Content", "Social Media",
    "SEO", "PR", "Brand ID", "Automation"
  ];

  const mobileServices = [
    "Branding", "Strategy", "UI/UX", "Web", 
    "Apps", "Marketing", "Content", "Social",
    "SEO", "PR", "Identity", "Automate"
  ];

  const displayServices = isMobile ? mobileServices : services;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#254899] via-[#1a3480] to-[#0f2166] px-4 sm:px-6 lg:px-8 overflow-hidden pt-16 md:pt-0">
      {/* Animated Background - Reduced on mobile */}
      <div className="absolute inset-0">
        {/* Floating Particles - Reduced on mobile */}
        <div className="hidden md:block absolute top-1/4 left-1/4 w-4 h-4 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 md:w-6 md:h-6 bg-[#ebed17] rounded-full opacity-40 animate-bounce"></div>
        <div className="hidden md:block absolute bottom-1/4 left-1/3 w-3 h-3 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 md:w-5 md:h-5 bg-[#254899] border border-[#ebed17] md:border-2 rounded-full opacity-30 animate-ping"></div>
        
        {/* Grid Pattern - Smaller on mobile */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(#ebed17 1px, transparent 1px), linear-gradient(90deg, #ebed17 1px, transparent 1px)`,
            backgroundSize: isMobile ? '30px 30px' : '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
        <div className="space-y-6 md:space-y-8 px-2">
          {/* Badge - Mobile optimized */}
          <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/30 rounded-full px-4 py-2 md:px-6 md:py-3 mb-4 md:mb-8 mt-20">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
            <span className="text-[#ebed17] font-semibold text-xs md:text-sm uppercase tracking-wider whitespace-nowrap">
              Comprehensive Solutions
            </span>
          </div>

          {/* Main Heading - Responsive text sizes */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-snug md:leading-tight px-2">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ebed17] to-[#f0f269] mt-2 md:mt-4">
              Digital Presence
            </span>
          </h1>

          {/* Description - Adjusted for mobile */}
          <div className="max-w-3xl mx-auto px-2 sm:px-4">
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-6 md:mb-8">
              End-to-end brand marketing and technology solutions designed to elevate your business, 
              engage your audience, and drive measurable growth.
            </p>
          </div>

          {/* Scrolling Services - Mobile optimized */}
          <div className="relative overflow-hidden py-4 md:py-6">
            <div className="flex animate-scroll-left space-x-4 md:space-x-8">
              {[...displayServices, ...displayServices].map((service, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl px-3 py-2 md:px-6 md:py-4 border border-white/20 hover:border-[#ebed17]/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#ebed17] rounded-full flex-shrink-0"></div>
                    <span className="text-sm md:text-lg font-medium text-white whitespace-nowrap">
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons - Stack on mobile, adjusted padding */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-6 md:pt-8 w-full max-w-md mx-auto">
            <button 
              onClick={() => scrollToSection("services")}
              className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 md:gap-3 w-full"
            >
              Explore Services
              <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="border border-white md:border-2 text-white hover:bg-white hover:text-[#254899] px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 w-full"
            >
              Get Started
            </button>
          </div>

        
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile for better UX */}
     
    </section>
  );
};

export default Servicepagehero;