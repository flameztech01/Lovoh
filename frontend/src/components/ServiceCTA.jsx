// components/services/ServiceCTA.jsx
import React from 'react';

const ServiceCTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#254899] to-[#1a3480] rounded-3xl p-8 lg:p-16 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #ebed17 2px, transparent 0)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-8 left-8 w-6 h-6 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-12 right-12 w-8 h-8 bg-[#ebed17] rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute bottom-8 left-12 w-4 h-4 bg-[#ebed17] rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-12 right-8 w-10 h-10 bg-[#254899] border-2 border-[#ebed17] rounded-full opacity-30 animate-ping"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
              <span className="text-[#ebed17] font-semibold text-sm uppercase tracking-wider">
                Ready to Start?
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Let's Create Something
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ebed17] to-[#f0f269]">
                Amazing Together
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              Your vision deserves a partner who can bring it to life with precision, 
              creativity, and strategic excellence. Let's discuss how we can help you 
              achieve your business goals.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3 h-3 bg-[#ebed17] rounded-full"></div>
                <span className="text-white/90 font-medium">Free Consultation</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3 h-3 bg-[#ebed17] rounded-full"></div>
                <span className="text-white/90 font-medium">Custom Proposal</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-3 h-3 bg-[#ebed17] rounded-full"></div>
                <span className="text-white/90 font-medium">No Obligation</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3">
                Start Your Project
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Schedule Call
              </button>
            </div>

            {/* Guarantee */}
            <div className="mt-8 flex items-center justify-center gap-3 text-white/70">
              <svg className="w-5 h-5 text-[#ebed17]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">100% Satisfaction Guarantee</span>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center">
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-[#254899] rounded-2xl flex items-center justify-center text-white text-xl mb-4 mx-auto">
              ⚡
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Quick Response</h4>
            <p className="text-gray-600 text-sm">Get a response within 2 hours during business days</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-[#ebed17] rounded-2xl flex items-center justify-center text-[#254899] text-xl mb-4 mx-auto">
              💼
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Flexible Engagement</h4>
            <p className="text-gray-600 text-sm">Project-based or ongoing partnership models</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 bg-[#254899] rounded-2xl flex items-center justify-center text-white text-xl mb-4 mx-auto">
              🎯
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Clear Process</h4>
            <p className="text-gray-600 text-sm">Transparent workflow with regular updates</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceCTA;