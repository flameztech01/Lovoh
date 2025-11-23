// screens/PuulsScreen.jsx
import React from 'react';
import Header from '../components/Header';
import { 
  FaPalette, 
  FaVideo, 
  FaLaptopCode, 
  FaBullhorn,
  FaClipboardList,
  FaSearch,
  FaRocket,
  FaChartLine
} from 'react-icons/fa';

const PuulsScreen = () => {
  const talentCategories = [
    {
      icon: <FaPalette className="text-2xl" />,
      title: 'Design & Visuals',
      talents: ['UI/UX Designers', 'Graphic Designers', 'Motion Designers', 'Brand Identity Specialists'],
      color: 'from-[#004BFF] to-[#0033CC]'
    },
    {
      icon: <FaVideo className="text-2xl" />,
      title: 'Video & Animation',
      talents: ['Video Editors', 'Animators', 'Content Creators', 'Post-Production Experts'],
      color: 'from-[#004BFF] to-[#0033CC]'
    },
    {
      icon: <FaLaptopCode className="text-2xl" />,
      title: 'Web & App Development',
      talents: ['Frontend Developers', 'Backend Developers', 'Mobile App Developers', 'Full-Stack Engineers'],
      color: 'from-[#004BFF] to-[#0033CC]'
    },
    {
      icon: <FaBullhorn className="text-2xl" />,
      title: 'Digital Solutions',
      talents: ['Digital Marketers', 'SEO Specialists', 'Social Media Managers', 'Growth Hackers'],
      color: 'from-[#004BFF] to-[#0033CC]'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Define Your Needs',
      description: 'Tell us exactly what skills and expertise you require for your project',
      icon: <FaClipboardList className="text-2xl" />
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'We connect you with pre-vetted experts from our talent pool',
      icon: <FaSearch className="text-2xl" />
    },
    {
      step: '03',
      title: 'Start Working',
      description: 'Begin your project with your dedicated talent team',
      icon: <FaRocket className="text-2xl" />
    },
    {
      step: '04',
      title: 'Scale as Needed',
      description: 'Easily scale your team up or down based on project requirements',
      icon: <FaChartLine className="text-2xl" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="mt-15 relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004BFF] via-[#0033CC] to-[#002699] px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="space-y-8">
            {/* Sub-brand Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/2copy.png" 
                alt="Puuls" 
                className="h-16 w-auto rounded-md border border-white"
              />
            </div>

            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                A Lovoh Create Brand
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Ƥuuls
            </h1>
            
            {/* Tagline */}
            <div className="space-y-4">
              <p className="text-2xl lg:text-3xl text-gray-200">
                the workforce you need
              </p>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Pool of top creative & tech associates for design, visuals, video, 
                web/app, and digital solutions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="bg-white hover:bg-gray-100 text-[#004BFF] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Find Talent
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#004BFF] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Join as Talent
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 max-w-2xl mx-auto">
              {/* <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">500+</div>
                <div className="text-gray-200 text-sm">Expert Associates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">50+</div>
                <div className="text-gray-200 text-sm">Skills Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">24h</div>
                <div className="text-gray-200 text-sm">Average Match Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">98%</div>
                <div className="text-gray-200 text-sm">Client Satisfaction</div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Talent Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                Talent Match
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Access our curated pool of top-tier creative and technical professionals 
              ready to bring your projects to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {talentCategories.map((category, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#004BFF] to-[#0033CC] rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {category.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#004BFF] transition-colors duration-300">
                      {category.title}
                    </h3>
                    
                    <div className="space-y-2">
                      {category.talents.map((talent, talentIndex) => (
                        <div key={talentIndex} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#004BFF] rounded-full"></div>
                          <span className="text-gray-700">{talent}</span>
                        </div>
                      ))}
                    </div>

                    <button className="mt-6 px-6 py-3 bg-[#004BFF] hover:bg-[#0033CC] text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                      Browse {category.title}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How Ƥuuls
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simple, efficient, and designed to get you the right talent exactly when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div 
                key={index}
                className="group text-center relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-[#004BFF] to-[#0033CC] rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-[#004BFF] rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#004BFF] transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line (Desktop) */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#004BFF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Build Your Dream Team?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Access top talent on demand and scale your projects with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-gray-100 text-[#004BFF] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Get Started Now
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-[#004BFF] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PuulsScreen;