// components/about/MissionVision.jsx
import React from 'react';
import { FaBullseye, FaBinoculars } from 'react-icons/fa';

const Missionvision = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#254899] to-[#1a3480]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#254899] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBullseye className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
            </div>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                To empower forward-thinking businesses with innovative brand marketing 
                and technology solutions that drive measurable growth and create lasting 
                impact in their markets.
              </p>
              
              <p>
                We combine strategic thinking with creative excellence to transform 
                complex challenges into opportunities for success.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-[#254899] font-semibold">
                <div className="w-2 h-2 bg-[#254899] rounded-full"></div>
                Driving measurable business growth
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#ebed17] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBinoculars className="text-[#254899] text-2xl" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
            </div>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                To be the most trusted brand partner for innovative companies seeking 
                to redefine their industries through cutting-edge marketing and 
                technology solutions.
              </p>
              
              <p>
                We envision a future where every great idea has the strategic support 
                and technological foundation it needs to thrive in the digital age.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-[#254899] font-semibold">
                <div className="w-2 h-2 bg-[#ebed17] rounded-full"></div>
                Redefining industry standards
              </div>
            </div>
          </div>
        </div>

        {/* Core Focus */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-[#ebed17] rounded-full px-6 py-3">
            <span className="text-[#254899] font-bold text-lg">
              Brand Marketing × Technology × Strategy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Missionvision;