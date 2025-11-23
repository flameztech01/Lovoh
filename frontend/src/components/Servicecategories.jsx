// components/services/ServiceCategories.jsx
import React, { useState } from 'react';
import { 
  FaPalette, 
  FaMobileAlt, 
  FaLaptopCode, 
  FaCrosshairs, 
  FaChartBar, 
  FaPenAlt 
} from 'react-icons/fa';

const Servicecategories = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    {
      id: 0,
      title: "Brand Development",
      icon: <FaPalette />,
      description: "Comprehensive brand strategy and identity development",
      services: [
        "Brand Strategy & Positioning",
        "Visual Identity Design",
        "Brand Guidelines",
        "Brand Messaging",
        "Market Research & Analysis"
      ],
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      id: 1,
      title: "Digital Marketing",
      icon: <FaMobileAlt />,
      description: "Data-driven marketing strategies for digital growth",
      services: [
        "Social Media Marketing",
        "Content Strategy & Creation",
        "SEO & SEM",
        "Email Marketing",
        "Marketing Automation"
      ],
      color: "from-[#ebed17] to-[#f0f269]"
    },
    {
      id: 2,
      title: "Web & App Development",
      icon: <FaLaptopCode />,
      description: "Custom digital solutions built for performance",
      services: [
        "Website Development",
        "Mobile App Development",
        "E-commerce Solutions",
        "Web Applications",
        "API Integration"
      ],
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      id: 3,
      title: "UI/UX Design",
      icon: <FaCrosshairs />,
      description: "User-centered design for exceptional digital experiences",
      services: [
        "User Research & Testing",
        "Wireframing & Prototyping",
        "Interface Design",
        "User Experience Design",
        "Design Systems"
      ],
      color: "from-[#ebed17] to-[#f0f269]"
    },
    {
      id: 4,
      title: "Strategy & Consulting",
      icon: <FaChartBar />,
      description: "Strategic guidance for business growth and innovation",
      services: [
        "Digital Transformation",
        "Business Strategy",
        "Market Analysis",
        "Competitive Research",
        "Growth Planning"
      ],
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      id: 5,
      title: "Content & Communications",
      icon: <FaPenAlt />,
      description: "Compelling content that connects and converts",
      services: [
        "Content Creation",
        "Copywriting",
        "Public Relations",
        "Social Media Management",
        "Video Production"
      ],
      color: "from-[#ebed17] to-[#f0f269]"
    }
  ];

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#254899]/10 backdrop-blur-sm border border-[#254899]/20 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#254899] rounded-full animate-pulse"></div>
            <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
              Our Services
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#254899] to-[#ebed17]">
              Digital Solutions
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From brand strategy to technical implementation, we offer end-to-end solutions 
            tailored to your business goals and market needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-8">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    activeCategory === index
                      ? `bg-gradient-to-r ${category.color} text-white shadow-2xl`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl ${activeCategory === index ? 'scale-110' : ''} transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{category.title}</h3>
                      <p className={`text-sm ${
                        activeCategory === index ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {category.services.length} services
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Category Details */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                  categories[activeCategory].color.includes('254899') 
                    ? 'bg-[#254899] text-white' 
                    : 'bg-[#ebed17] text-[#254899]'
                }`}>
                  {categories[activeCategory].icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {categories[activeCategory].title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {categories[activeCategory].description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {categories[activeCategory].services.map((service, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#254899] transition-all duration-300 group"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      categories[activeCategory].color.includes('254899') 
                        ? 'bg-[#254899]' 
                        : 'bg-[#ebed17]'
                    } group-hover:scale-125 transition-transform duration-300`}></div>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                      {service}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button className="bg-[#254899] hover:bg-[#1a3480] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex-1 text-center">
                  Get Quote for {categories[activeCategory].title}
                </button>
                <button className="border-2 border-[#254899] text-[#254899] hover:bg-[#254899] hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex-1 text-center">
                  View Case Studies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Servicecategories;