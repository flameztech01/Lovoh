// screens/UduuaScreen.jsx
import React from 'react';
import Header from '../components/Header.jsx';
import { 
  FaUsers,
  FaChartLine,
  FaBullseye,
  FaRocket,
  FaStar,
  FaShieldAlt
} from 'react-icons/fa';

const UduuaScreen = () => {
  const features = [
    {
      icon: <FaUsers className="text-2xl" />,
      title: 'Real Influencers',
      description: 'Authentic creators with engaged communities that drive real results'
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: 'Performance Experts',
      description: 'Data-driven specialists who optimize campaigns for maximum ROI'
    },
    {
      icon: <FaBullseye className="text-2xl" />,
      title: 'Targeted Promoters',
      description: 'Strategic promoters who reach your exact target audience'
    },
    {
      icon: <FaRocket className="text-2xl" />,
      title: 'Sales Push Network',
      description: 'Coordinated campaigns that create momentum and drive conversions'
    }
  ];

  const services = [
    {
      title: 'Influencer Marketing',
      description: 'Leverage authentic creators to build trust and drive conversions',
      results: ['Increased brand awareness', 'Higher engagement rates', 'Authentic content creation']
    },
    {
      title: 'Performance Marketing',
      description: 'Data-driven campaigns optimized for maximum return on investment',
      results: ['Measurable results', 'Optimized ad spend', 'Scalable growth']
    },
    {
      title: 'Sales Promotion',
      description: 'Strategic campaigns that create urgency and drive immediate sales',
      results: ['Increased conversions', 'Higher average order value', 'Repeat purchases']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="mt-10 relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0043FC] via-[#0038D4] to-[#002DAC] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="space-y-8">
            {/* Sub-brand Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/4copy.png" 
                alt="Uduua" 
                className="h-16 w-auto rounded-md"
              />
            </div>

            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 bg-[#79FFFF]/10 backdrop-blur-sm border border-[#79FFFF]/30 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-[#79FFFF] rounded-full animate-pulse"></div>
              <span className="text-[#79FFFF] font-semibold text-sm uppercase tracking-wider">
                A Lovoh Create Brand
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Úduua
            </h1>
            
            {/* Tagline */}
            <div className="space-y-4">
              <p className="text-2xl lg:text-3xl text-gray-200 italic">
                …make it sell
              </p>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Marketing and sales push network powered by real influencers, promoters, 
                and performance experts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="bg-[#79FFFF] hover:bg-[#a6fffe] text-[#0043FC] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Selling Now
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#0043FC] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Book Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0043FC] mb-6">
              The Úduua
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#79FFFF] to-[#0043FC]">
                Advantage
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We combine authentic influence with data-driven performance to create 
              marketing campaigns that actually sell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group text-center p-8 bg-gray-50 rounded-3xl hover:bg-gradient-to-br hover:from-[#0043FC] hover:to-[#0038D4] transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="w-20 h-20 bg-[#0043FC] rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:bg-[#79FFFF] group-hover:text-[#0043FC] transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0043FC] mb-6">
              Our Sales
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#79FFFF] to-[#0043FC]">
                Solutions
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#0043FC] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-3">
                  {service.results.map((result, resultIndex) => (
                    <div key={resultIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#79FFFF] rounded-full"></div>
                      <span className="text-gray-700 text-sm">{result}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 bg-[#0043FC] hover:bg-[#0038D4] text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0043FC]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Make It Sell?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join brands that are already driving real results with Úduua's powerful 
            marketing and sales network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#79FFFF] hover:bg-[#a6fffe] text-[#0043FC] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Get Started Today
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-[#0043FC] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              View Case Studies
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UduuaScreen;