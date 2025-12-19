// screens/UduuaScreen.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { 
  FaUsers,
  FaChartLine,
  FaBullseye,
  FaRocket,
  FaChevronRight,
  FaCheck,
  FaArrowRight,
  FaPlayCircle,
  FaStar
} from 'react-icons/fa';

const UduuaScreen = () => {
  const [activeImage, setActiveImage] = useState(0);
  const availableImages = ['/now1.jpg', '/now2.jpg', '/now3.jpg', '/now4.jpg'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % availableImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <FaRocket className="text-xl" />,
      title: 'Distribution and Sales Push',
      description: 'Coordinated campaigns that create momentum and drive conversions',
      image: '/now1.jpg'
    },
    {
      icon: <FaChartLine className="text-xl" />,
      title: 'Performance Experts',
      description: 'Data-driven specialists who optimize campaigns for maximum ROI',
      image: '/now2.jpg'
    },
    {
      icon: <FaBullseye className="text-xl" />,
      title: 'Targeted Promoters',
      description: 'Strategic promoters who reach your exact target audience',
      image: '/now3.jpg'
    },
    {
      icon: <FaUsers className="text-xl" />,
      title: 'Real Influencers',
      description: 'Authentic creators with engaged communities that drive real results',
      image: '/now4.jpg'
    },
  ];

  const services = [
    {
      title: 'Influencer Marketing',
      description: 'Leverage authentic creators to build trust and drive conversions',
      results: ['Increased brand awareness', 'Higher engagement rates', 'Authentic content creation'],
      image: '/now1.jpg'
    },
    {
      title: 'Performance Marketing',
      description: 'Data-driven campaigns optimized for maximum return on investment',
      results: ['Measurable results', 'Optimized ad spend', 'Scalable growth'],
      image: '/now2.jpg'
    },
    {
      title: 'Sales Promotion',
      description: 'Strategic campaigns that create urgency and drive immediate sales',
      results: ['Increased conversions', 'Higher average order value', 'Repeat purchases'],
      image: '/now3.jpg'
    },
    {
      title: 'Market Distribution',
      description: 'Extensive network to ensure your products reach the right customers',
      results: ['Wider reach', 'Targeted audience access', 'Improved market penetration'],
      image: '/now4.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* UNIQUE HERO DESIGN - Split Layout with Floating Elements */}
      <section className="h-screen relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-[#79FFFF]/20">
        {/* Abstract Geometric Background */}
        <div className="absolute inset-0">
          {/* Large Circle */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-gradient-to-r from-[#0043FC]/10 to-[#79FFFF]/5 blur-3xl"></div>
          {/* Diagonal Line Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #0043FC 0px,
              #0043FC 1px,
              transparent 1px,
              transparent 20px
            )`
          }}></div>
        </div>
        
        {/* Floating Image Cards */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {availableImages.map((img, index) => (
            <div 
              key={index}
              className={`absolute transition-all duration-1000 ease-out ${
                index === activeImage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                top: `${20 + index * 15}%`,
                left: `${60 + index * 5}%`,
                transform: `rotate(${index * 10}deg)`,
              }}
            >
              <div className="relative w-48 h-56 md:w-64 md:h-72">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0043FC] to-[#79FFFF] rounded-2xl transform rotate-3"></div>
                <img
                  src={img}
                  alt="Marketing Success"
                  className="absolute inset-2 rounded-xl object-cover w-full h-full shadow-2xl"
                />
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#0043FC] rounded-full flex items-center justify-center text-white shadow-lg">
                  <FaStar />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Hero Content - Left Aligned */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-full flex items-center">
            <div className="lg:w-1/2 space-y-6 md:space-y-6">
              {/* Logo and Brand */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3">
                  <img 
                    src="/4copy.png" 
                    alt="Uduua" 
                    className="h-10 w-auto mt-30"
                  />
                  {/* <div className="h-6 w-px bg-gradient-to-b from-transparent via-[#0043FC] to-transparent"></div>
                  <div className="text-xs font-semibold text-[#0043FC] uppercase tracking-widest">
                    A Lovoh Create Brand
                  </div> */}
                </div>
                
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0043FC]/10 to-[#79FFFF]/10 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-[#0043FC] rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-[#0043FC]">Revenue Accelerator</span>
                  </div>
                </div>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="text-[#0043FC]">Sell More</span>
                  <br />
                  <span className="relative">
                    With Less Stress
                    <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-[#79FFFF] to-[#0043FC]"></div>
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
                  Transform your products into best-sellers with our network of 10,000+ 
                  real distributors, promoters, and performance experts.
                </p>
              </div>
              
              {/* Stats in Cards */}
              <div className="grid grid-cols-3 gap-3 max-w-md">
                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
                  <div className="text-xl font-bold text-[#0043FC]">3.5x</div>
                  <div className="text-xs text-gray-600">Avg. ROI</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
                  <div className="text-xl font-bold text-[#0043FC]">24h</div>
                  <div className="text-xs text-gray-600">Setup Time</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
                  <div className="text-xl font-bold text-[#0043FC]">10K+</div>
                  <div className="text-xs text-gray-600">Network</div>
                </div>
              </div>
              
              {/* CTA Buttons with Unique Layout */}
              <div className="flex flex-col sm:flex-row gap-4 items-start pt-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="group relative bg-gradient-to-r from-[#0043FC] to-[#79FFFF] hover:from-[#0038D4] hover:to-[#60E0E0] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      <FaRocket /> Start Selling Now
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#79FFFF] to-[#0043FC] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <button className="group bg-white hover:bg-gray-50 border-2 border-[#0043FC] text-[#0043FC] hover:text-[#0038D4] px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                    <FaPlayCircle /> Watch Demo
                  </button>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0043FC] to-[#79FFFF] border-2 border-white"></div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-[#0043FC]">500+</span> brands trust Uduua
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Navigation Dots - Vertical */}
          <div className="hidden lg:flex absolute right-8 top-1/2 transform -translate-y-1/2 flex-col gap-3">
            {availableImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeImage 
                    ? 'bg-[#0043FC] scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          {/* Scroll Indicator - Animated */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-2">Explore Solutions</span>
              <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center relative">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#0043FC] to-[#79FFFF] rounded-full absolute top-2 animate-scroll"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              The Úduua
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0043FC] to-[#79FFFF]">
                Advantage
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine authentic influence with data-driven performance to create 
              marketing campaigns that actually sell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <div className="relative h-40 mb-4 rounded-xl overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#0043FC] shadow-md">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#0043FC] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Sales
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0043FC] to-[#79FFFF]">
                Solutions
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#0043FC] text-white text-xs font-bold px-3 py-1 rounded-full">
                      0{index + 1}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {service.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-start gap-3">
                        <FaCheck className="text-[#79FFFF] flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-sm">{result}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-[#0043FC] to-[#79FFFF] hover:from-[#0038D4] hover:to-[#60E0E0] text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                    Learn More
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0043FC] to-[#79FFFF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Make It Sell?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join 500+ brands already accelerating revenue with Uduua.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-gray-50 text-[#0043FC] px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <FaRocket /> Get Started Today
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-[#0043FC] px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              View Case Studies
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UduuaScreen;