// components/about/OurStory.jsx
import React from 'react';

const Ourstory = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[#254899] font-semibold text-sm uppercase tracking-wider">
                <div className="w-2 h-2 bg-[#254899] rounded-full"></div>
                Our Journey
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                From Vision to
                <span className="block text-[#254899]">Reality</span>
              </h2>
            </div>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg">
                Founded in 2019, Lovoh Create emerged from a simple yet powerful vision: 
                to bridge the gap between innovative ideas and their successful implementation 
                in the market.
              </p>
              
              <p>
                We started as a small team of passionate creatives and technologists, 
                united by the belief that every great brand deserves a partner who understands 
                both the art of storytelling and the science of digital transformation.
              </p>

              <p>
                Today, we've grown into a full-service agency that has helped over 50 businesses 
                transform their vision into market-leading brands through strategic marketing 
                and cutting-edge technology solutions.
              </p>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="text-center p-4 bg-[#254899]/5 rounded-lg">
                <div className="text-2xl font-bold text-[#254899] mb-1">2019</div>
                <div className="text-sm text-gray-600">Founded</div>
              </div>
              <div className="text-center p-4 bg-[#254899]/5 rounded-lg">
                <div className="text-2xl font-bold text-[#254899] mb-1">150+</div>
                <div className="text-sm text-gray-600">Projects Delivered</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#254899] to-[#1a3480] rounded-2xl p-8 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #ebed17 1px, transparent 0)`,
                  backgroundSize: '30px 30px'
                }}></div>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-[#ebed17] rounded-full flex items-center justify-center">
                  <span className="text-[#254899] font-bold text-lg">💡</span>
                </div>
                
                <blockquote className="text-2xl lg:text-3xl font-bold leading-tight">
                  "Ideas that Work are Worked."
                </blockquote>
                
                <p className="text-[#ebed17] text-lg">
                  Our founding principle that drives every project
                </p>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-[#ebed17] rounded-full opacity-20"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-[#ebed17] rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ourstory;