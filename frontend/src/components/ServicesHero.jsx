import React from 'react';

const ServicesHero = () => {

   const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Flatten all service items into a single array
  const allServices = [
    "Brand Development", "Strategy", "Design",
    "Digital Media", "Marketing", "Communications", 
    "Web & App Development", "Experience", "PR"
  ];

  // Create three rows with duplicated items for seamless scrolling
  const firstRow = [...allServices, ...allServices];
  const secondRow = [...allServices, ...allServices];
  const thirdRow = [...allServices, ...allServices];

  return (
    <section className="z-20 min-h-screen bg-gradient-to-br from-[#054889] via-[#004aff] to-[#3c3c4e] text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 lg:mb-24">
          
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
            Explore Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#37acf7] to-[#79ffff]">
              Services
            </span>
          </h1>

          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-xl text-gray-300 leading-relaxed">
              Lovoh Create is a dynamic Brand Marketing & Tech Agency, capitalizing on the power of vision, strategy, cutting-edge creativity, and technology to develop and deploy effective ideas and solutions, for forward-thinking businesses with great culture, products and services.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h4 className="text-2xl lg:text-3xl font-bold text-center leading-relaxed">
                We're in the business of connecting <span className="text-[#37acf7]">brands + people</span>.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebed47] to-[#79ffff]">
                  Let's Supercharge Your Brand!
                </span>
              </h4>
            </div>
          </div>
        </div>

        {/* Scrolling Service Rows */}
        <div className="space-y-8 mb-16">
          {/* First Row - Left to Right */}
          <div className="relative overflow-hidden py-4">
            <div className="flex animate-scroll-left space-x-6">
              {firstRow.map((service, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20 hover:border-[#37acf7]/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#37acf7] rounded-full"></div>
                    <span className="text-lg font-medium text-white whitespace-nowrap">
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Right to Left */}
          <div className="relative overflow-hidden py-4">
            <div className="flex animate-scroll-right space-x-6">
              {secondRow.map((service, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20 hover:border-[#79ffff]/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#79ffff] rounded-full"></div>
                    <span className="text-lg font-medium text-white whitespace-nowrap">
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Third Row - Left to Right */}
          <div className="relative overflow-hidden py-4">
            <div className="flex animate-scroll-left space-x-6">
              {thirdRow.map((service, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20 hover:border-[#ebed47]/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#ebed47] rounded-full"></div>
                    <span className="text-lg font-medium text-white whitespace-nowrap">
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
            <button 
            onClick={() => scrollToSection("contact")} 
            className="z-20 bg-gradient-to-r from-[#004aff] to-[#2f7dcb] hover:from-[#054889] hover:to-[#004aff] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
              Start Your Project
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
        
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-[#37acf7] rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-[#79ffff] rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-[#ebed47] rounded-full opacity-60 animate-pulse"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </section>
  );
};

export default ServicesHero;