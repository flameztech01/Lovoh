// screens/PuulsScreen.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { 
  FaPalette, 
  FaVideo, 
  FaLaptopCode, 
  FaBullhorn,
  FaClipboardList,
  FaSearch,
  FaRocket,
  FaChartLine,
  FaChevronRight,
  FaArrowRight
} from 'react-icons/fa';

const PuulsScreen = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const talentImages = ['/now1.jpg', '/now2.jpg', '/now3.jpg', '/now4.jpg'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % talentImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const talentCategories = [
    {
      icon: <FaPalette className="text-xl" />,
      title: 'Design & Visuals',
      talents: ['UI/UX Designers', 'Graphic Designers', 'Motion Designers', 'Brand Identity Specialists'],
      image: '/now1.jpg'
    },
    {
      icon: <FaVideo className="text-xl" />,
      title: 'Video & Animation',
      talents: ['Video Editors', 'Animators', 'Content Creators', 'Post-Production Experts'],
      image: '/now2.jpg'
    },
    {
      icon: <FaLaptopCode className="text-xl" />,
      title: 'Web & App Development',
      talents: ['Frontend Developers', 'Backend Developers', 'Mobile App Developers', 'Full-Stack Engineers'],
      image: '/now3.jpg'
    },
    {
      icon: <FaBullhorn className="text-xl" />,
      title: 'Digital Solutions',
      talents: ['Digital Marketers', 'SEO Specialists', 'Social Media Managers', 'Growth Hackers'],
      image: '/now4.jpg'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Define Your Needs',
      description: 'Tell us exactly what skills and expertise you require',
      icon: <FaClipboardList className="text-lg" />
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Connect with pre-vetted experts from our talent pool',
      icon: <FaSearch className="text-lg" />
    },
    {
      step: '03',
      title: 'Start Working',
      description: 'Begin your project with your dedicated talent team',
      icon: <FaRocket className="text-lg" />
    },
    {
      step: '04',
      title: 'Scale as Needed',
      description: 'Easily scale your team based on project requirements',
      icon: <FaChartLine className="text-lg" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Compact Hero Section - One Screen Height */}
      <section className="h-screen relative flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {talentImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={img}
                alt="Creative Talent"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#004aff]/90 via-[#0033CC]/80 to-[#002699]/70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-6">
              {/* Brand Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-medium text-xs uppercase tracking-wider">
                  A Lovoh Create Brand
                </span>
              </div>
              
              {/* Sub-brand Logo */}
              <div className="mb-2">
                <img 
                  src="/2copy1.png" 
                  alt="Puuls" 
                  className="h-16 w-auto"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl text-white font-bold leading-tight">
                  What do you need help with today?
                </h1>
                <p className="text-lg text-gray-200 leading-relaxed">
                  We're a ready pool of top creative & tech associates for design, visuals, video, 
                  web/app, and digital solutions.
                </p>
              </div>

              {/* CTA Buttons - Compact */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button className="bg-white hover:bg-gray-100 text-[#004BFF] px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <FaRocket className="text-sm" /> Start Project
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-[#004BFF] px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                  <FaPalette className="text-sm" /> Join as Talent
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">500+</div>
                  <div className="text-gray-300 text-xs">Expert Associates</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">50+</div>
                  <div className="text-gray-300 text-xs">Skills Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">24h</div>
                  <div className="text-gray-300 text-xs">Average Match</div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Carousel */}
            <div className="hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={talentImages[currentImage]}
                  alt="Our Talent in Action"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {talentImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImage 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Carousel Controls */}
                <button 
                  onClick={() => setCurrentImage((prev) => (prev - 1 + talentImages.length) % talentImages.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <FaArrowRight className="rotate-180" />
                </button>
                <button 
                  onClick={() => setCurrentImage((prev) => (prev + 1) % talentImages.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                >
                  <FaArrowRight />
                </button>
              </div>

              {/* Image Categories Preview */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {talentCategories.slice(0, 2).map((category, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#004BFF]/80 to-transparent flex items-end p-3">
                      <span className="text-white text-sm font-semibold">{category.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-white text-sm mb-2">Explore More</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Rest of the content follows the hero section */}
      {/* Talent Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                Talent Match
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our army of top-tier creative and tech professionals 
              ready to bring your projects to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {talentCategories.map((category, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Category Image */}
                  <div className="w-1/3">
                    <div className="relative h-40 rounded-xl overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#004BFF] shadow-md">
                        {category.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Content */}
                  <div className="w-2/3">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#004BFF] transition-colors">
                      {category.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      {category.talents.map((talent, talentIndex) => (
                        <div key={talentIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#004BFF] rounded-full"></div>
                          <span className="text-gray-700 text-sm">{talent}</span>
                        </div>
                      ))}
                    </div>

                    <button className="px-4 py-2 bg-gradient-to-r from-[#004BFF] to-[#0033CC] hover:from-[#0033CC] hover:to-[#002699] text-white rounded-lg font-medium text-sm transition-all flex items-center gap-1">
                      Browse <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              See Our Talent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                In Action
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get inspired by the quality and diversity of work from our associates
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {talentImages.map((img, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={img}
                  alt={`Talent Work ${index + 1}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#004BFF]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-semibold text-sm">View Project</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Ƥuuls
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
                Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, efficient, and designed to get you the right talent exactly when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div 
                key={index}
                className="group text-center relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-r from-[#004BFF] to-[#0033CC] rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {step.step}
                </div>

                <div className="w-14 h-14 bg-[#004BFF] rounded-xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#004BFF] transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-r from-[#004BFF] to-[#0033CC]">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/now1.jpg"
            alt="CTA Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Build Your Dream Team?
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Access top talent on demand and scale your projects with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-gray-100 text-[#004BFF] px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <FaRocket /> Get Started Now
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-[#004BFF] px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PuulsScreen;