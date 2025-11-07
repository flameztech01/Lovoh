// components/about/AboutHero.jsx
import React from 'react';

const Abouthero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#254899] via-[#1a3480] to-[#0f2166] px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ebed17 2px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-6 h-6 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-8 h-8 bg-[#ebed17] rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute bottom-40 left-20 w-4 h-4 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-32 w-10 h-10 bg-[#254899] border-2 border-[#ebed17] rounded-full opacity-30 animate-ping"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/30 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
            <span className="text-[#ebed17] font-semibold text-sm uppercase tracking-wider">
              About Lovoh Create
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            Building Brands That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ebed17] to-[#f0f269]">
              Make Impact
            </span>
          </h1>

          {/* Description */}
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-300 leading-relaxed">
              We are a dynamic Brand Marketing & Tech Agency that transforms visionary concepts 
              into tangible solutions through dedicated execution and strategic implementation. 
              Your success is our blueprint.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ebed17] mb-2">150+</div>
              <div className="text-gray-300 text-sm uppercase tracking-wider">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ebed17] mb-2">98%</div>
              <div className="text-gray-300 text-sm uppercase tracking-wider">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ebed17] mb-2">5+</div>
              <div className="text-gray-300 text-sm uppercase tracking-wider">Years</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ebed17] mb-2">50+</div>
              <div className="text-gray-300 text-sm uppercase tracking-wider">Clients</div>
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

export default Abouthero;