// components/services/ServicesHero.jsx
import React from 'react';

const Servicepagehero = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const services = [
    "Brand Development", "Digital Strategy", "UI/UX Design", "Web Development", 
    "App Development", "Digital Marketing", "Content Creation", "Social Media Management",
    "SEO Optimization", "PR & Communications", "Brand Identity", "Marketing Automation"
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#254899] via-[#1a3480] to-[#0f2166] px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-[#ebed17] rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-[#254899] border-2 border-[#ebed17] rounded-full opacity-30 animate-ping"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(#ebed17 1px, transparent 1px), linear-gradient(90deg, #ebed17 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/30 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
            <span className="text-[#ebed17] font-semibold text-sm uppercase tracking-wider">
              Comprehensive Solutions
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ebed17] to-[#f0f269]">
              Digital Presence
            </span>
          </h1>

          {/* Description */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              End-to-end brand marketing and technology solutions designed to elevate your business, 
              engage your audience, and drive measurable growth in the digital landscape.
            </p>
          </div>

          {/* Scrolling Services */}
          <div className="relative overflow-hidden py-6">
            <div className="flex animate-scroll-left space-x-8">
              {[...services, ...services].map((service, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 hover:border-[#ebed17]/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#ebed17] rounded-full"></div>
                    <span className="text-lg font-medium text-white whitespace-nowrap">
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button 
              onClick={() => scrollToSection("services")}
              className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              Explore Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="border-2 border-white text-white hover:bg-white hover:text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#ebed17] mb-2">150+</div>
              <div className="text-gray-300 text-sm">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#ebed17] mb-2">98%</div>
              <div className="text-gray-300 text-sm">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#ebed17] mb-2">5+</div>
              <div className="text-gray-300 text-sm">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#ebed17] mb-2">50+</div>
              <div className="text-gray-300 text-sm">Happy Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-[#ebed17] rounded-full flex justify-center">
          <div className="w-1 h-3 bg-[#ebed17] rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Servicepagehero;