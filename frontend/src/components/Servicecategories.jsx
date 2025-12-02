// components/services/ServiceCategories.jsx
import React, { useState } from 'react';
import { 
  FaPalette, 
  FaMobileAlt, 
  FaLaptopCode, 
  FaCrosshairs, 
  FaChartBar, 
  FaPenAlt,
  FaTimes,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaBriefcase
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Servicecategories = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    budget: '',
    timeline: ''
  });

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

  const handleGetQuote = (categoryTitle) => {
    setFormData(prev => ({
      ...prev,
      service: categoryTitle,
      message: `I'm interested in getting a quote for ${categoryTitle} services.`
    }));
    setShowQuoteForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    
    // Simulate API call
    const loadingToast = toast.loading('Sending your quote request...');
    
    try {
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.dismiss(loadingToast);
      toast.success(`Quote request sent to ${formData.email}! We'll get back to you within 24 hours.`);
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: '',
        budget: '',
        timeline: ''
      });
      setShowQuoteForm(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to send quote request. Please try again.');
    }
  };

  return (
    <>
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
                  <button 
                    onClick={() => handleGetQuote(categories[activeCategory].title)}
                    className="bg-[#254899] hover:bg-[#1a3480] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex-1 text-center"
                  >
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

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowQuoteForm(false)}
              className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#254899] to-[#ebed17] mb-4">
                  <FaEnvelope className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Get Your Custom Quote
                </h3>
                <p className="text-gray-600">
                  Fill in the details below and we'll send a personalized quote to your email
                </p>
              </div>

              {/* Service Preview */}
              <div className="mb-8 p-4 bg-gradient-to-r from-[#254899]/10 to-[#ebed17]/10 rounded-2xl border border-[#254899]/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#254899]"></div>
                  <span className="font-semibold text-[#254899]">Selected Service:</span>
                  <span className="font-bold">{formData.service}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitQuote} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline w-4 h-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline w-4 h-4 mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaBriefcase className="inline w-4 h-4 mr-2" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                  >
                    <option value="">Select budget range</option>
                    <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                    <option value="$15,000 - $30,000">$15,000 - $30,000</option>
                    <option value="$30,000 - $50,000">$30,000 - $50,000</option>
                    <option value="$50,000+">$50,000+</option>
                    <option value="Not sure">Not sure yet</option>
                  </select>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                  >
                    <option value="">Select timeline</option>
                    <option value="ASAP">ASAP</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2-3 months">2-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="Not sure">Not sure yet</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#254899] focus:ring-2 focus:ring-[#254899]/20 outline-none transition-all"
                    placeholder="Tell us more about your project requirements..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#254899] to-[#ebed17] hover:from-[#1a3480] hover:to-[#d4d615] text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Get Quote Now
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  We'll send the detailed quote to {formData.email || "your email"} within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Servicecategories;