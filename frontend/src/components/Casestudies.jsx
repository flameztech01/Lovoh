// components/services/CaseStudies.jsx
import React from 'react';

const Casestudies = () => {
  const caseStudies = [
    {
      id: 1,
      title: "E-commerce Brand Transformation",
      client: "Fashion Retailer",
      category: "Brand Development",
      results: "245% revenue growth in 6 months",
      description: "Complete brand overhaul including strategy, identity, and digital transformation",
      image: "/now1.jpg",
      services: ["Brand Strategy", "UI/UX Design", "Web Development", "Digital Marketing"],
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      id: 2,
      title: "SaaS Platform Launch",
      client: "Tech Startup",
      category: "Web Development",
      results: "15,000+ users in first quarter",
      description: "End-to-end development of a scalable SaaS platform with advanced features",
      image: "/now2.jpg",
      services: ["Web Development", "UI/UX Design", "API Integration", "Cloud Deployment"],
      color: "from-[#ebed17] to-[#f0f269]"
    },
    {
      id: 3,
      title: "Digital Marketing Campaign",
      client: "Healthcare Provider",
      category: "Digital Marketing",
      results: "300% lead generation increase",
      description: "Comprehensive digital marketing strategy driving qualified leads and conversions",
      image: "/now3.jpg",
      services: ["SEO", "Content Marketing", "Social Media", "PPC Campaigns"],
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      id: 4,
      title: "Mobile App Revolution",
      client: "FinTech Company",
      category: "App Development",
      results: "4.8★ rating with 50K+ downloads",
      description: "Feature-rich mobile application with seamless user experience and security",
      image: "/now4.jpg",
      services: ["Mobile Development", "UI/UX Design", "Security", "App Store Optimization"],
      color: "from-[#ebed17] to-[#f0f269]"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#254899]/10 backdrop-blur-sm border border-[#254899]/20 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#254899] rounded-full animate-pulse"></div>
            <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
              Success Stories
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Proven Results
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#254899] to-[#ebed17]">
              Case Studies
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how we've helped businesses across industries achieve remarkable growth 
            and transform their digital presence.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {caseStudies.map((study, index) => (
            <div 
              key={study.id}
              className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={study.image} 
                  alt={study.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      study.color.includes('254899') ? 'bg-[#ebed17]' : 'bg-[#254899]'
                    }`}></div>
                    <span className="text-white/80 text-sm font-medium">{study.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{study.title}</h3>
                  <p className="text-white/70 text-sm">{study.client}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${
                    study.color.includes('254899') ? 'bg-[#254899]' : 'bg-[#ebed17]'
                  }`}></div>
                  <span className="text-lg font-bold text-gray-900">{study.results}</span>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">{study.description}</p>

                {/* Services Used */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Services Provided:</h4>
                  <div className="flex flex-wrap gap-2">
                    {study.services.map((service, serviceIndex) => (
                      <span 
                        key={serviceIndex}
                        className={`text-xs px-3 py-1 rounded-full ${
                          study.color.includes('254899') 
                            ? 'bg-[#254899]/10 text-[#254899] border border-[#254899]/20'
                            : 'bg-[#ebed17]/10 text-[#254899] border border-[#ebed17]/20'
                        }`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  study.color.includes('254899') 
                    ? 'bg-[#254899] hover:bg-[#1a3480] text-white'
                    : 'bg-[#ebed17] hover:bg-[#f0f269] text-[#254899]'
                }`}>
                  View Full Case Study
                </button>
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 border-2 ${
                study.color.includes('254899') ? 'border-[#254899]' : 'border-[#ebed17]'
              } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-[#254899] to-[#1a3480] rounded-3xl p-8 lg:p-12 text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-[#ebed17] mb-2">150+</div>
              <div className="text-white/80 text-sm">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-[#ebed17] mb-2">98%</div>
              <div className="text-white/80 text-sm">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-[#ebed17] mb-2">5M+</div>
              <div className="text-white/80 text-sm">Revenue Generated</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-[#ebed17] mb-2">50+</div>
              <div className="text-white/80 text-sm">Industries Served</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Casestudies;