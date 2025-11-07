// components/about/Values.jsx
import React from 'react';

const Values = () => {
  const values = [
    {
      icon: '⚡',
      title: 'Innovation First',
      description: 'We constantly push boundaries and explore new technologies to deliver cutting-edge solutions that keep our clients ahead of the curve.',
      color: 'from-[#ebed17] to-[#f0f269]'
    },
    {
      icon: '🎯',
      title: 'Strategic Excellence',
      description: 'Every project is backed by thorough research, data-driven insights, and strategic planning to ensure maximum impact and ROI.',
      color: 'from-[#254899] to-[#1a3480]'
    },
    {
      icon: '🤝',
      title: 'Partnership Mindset',
      description: 'We work as an extension of your team, building long-term relationships based on trust, transparency, and shared success.',
      color: 'from-[#ebed17] to-[#f0f269]'
    },
    {
      icon: '🚀',
      title: 'Results-Driven',
      description: 'We measure our success by your success. Every strategy is designed to deliver tangible business results and measurable growth.',
      color: 'from-[#254899] to-[#1a3480]'
    },
    {
      icon: '💎',
      title: 'Quality Obsessed',
      description: 'From concept to execution, we maintain the highest standards of quality, attention to detail, and craftsmanship in everything we deliver.',
      color: 'from-[#ebed17] to-[#f0f269]'
    },
    {
      icon: '🔄',
      title: 'Agile Approach',
      description: 'We adapt quickly to changing market dynamics and client needs, ensuring our solutions remain relevant and effective in a fast-paced world.',
      color: 'from-[#254899] to-[#1a3480]'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#254899]/10 backdrop-blur-sm border border-[#254899]/20 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#254899] rounded-full animate-pulse"></div>
            <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
              Our Values
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The Principles That
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#254899] to-[#ebed17]">
              Drive Us Forward
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our core values are the foundation of everything we do. They guide our decisions, 
            shape our culture, and ensure we deliver exceptional results for our partners.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-2xl ${
                value.color.includes('ebed17') ? 'bg-[#ebed17] text-[#254899]' : 'bg-[#254899] text-white'
              } group-hover:scale-110 transition-transform duration-300`}>
                {value.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#254899] transition-colors duration-300">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {value.description}
              </p>

              {/* Hover Border */}
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 ${
                value.color.includes('ebed17') ? 'bg-[#ebed17]' : 'bg-[#254899]'
              } group-hover:w-3/4 transition-all duration-500 rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl px-8 py-6 shadow-lg border border-gray-100">
            <div className="w-3 h-3 bg-[#ebed17] rounded-full animate-pulse"></div>
            <p className="text-lg font-semibold text-gray-900">
              Ready to build something amazing together?
            </p>
            <button className="bg-[#254899] hover:bg-[#1a3480] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105">
              Start Your Project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Values;