// screens/TheFruiitScreen.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { 
  FaStar,
  FaCrown,
  FaPalette,
  FaBriefcase,
  FaRocket,
  FaHandshake,
  FaBook,
  FaUsers,
  FaCalendarAlt,
  FaBullseye,
  FaLeaf,
  FaSeedling,
  FaAppleAlt,
  FaTree,
  FaChevronRight,
  FaPlay
} from 'react-icons/fa';

const TheFruiitScreen = () => {
  const [activeSegment, setActiveSegment] = useState(0);
  const [floatingFruits, setFloatingFruits] = useState([]);
  
  // Create floating fruit animation
  useEffect(() => {
    const fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍉', '🥭', '🍍'];
    const newFruits = [];
    
    for (let i = 0; i < 8; i++) {
      newFruits.push({
        id: i,
        emoji: fruits[i],
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 20 + Math.random() * 30,
        duration: 10 + Math.random() * 20,
        delay: Math.random() * 5
      });
    }
    
    setFloatingFruits(newFruits);
  }, []);
  
  const developmentAreas = [
    {
      icon: <FaStar className="text-2xl" />,
      title: 'Lifestyle',
      description: 'Cultivate habits and mindsets for balanced, fulfilling personal growth',
      benefits: ['Mindfulness practices', 'Health & wellness', 'Personal organization', 'Work-life balance']
    },
    {
      icon: <FaCrown className="text-2xl" />,
      title: 'Leadership',
      description: 'Develop the skills to inspire, influence, and lead with purpose',
      benefits: ['Communication skills', 'Decision making', 'Team management', 'Strategic thinking']
    },
    {
      icon: <FaPalette className="text-2xl" />,
      title: 'Creativity',
      description: 'Unlock your creative potential and innovative thinking abilities',
      benefits: ['Creative problem-solving', 'Innovation techniques', 'Artistic expression', 'Design thinking']
    },
    {
      icon: <FaBriefcase className="text-2xl" />,
      title: 'Career',
      description: 'Accelerate your professional growth and career advancement',
      benefits: ['Career planning', 'Skill development', 'Networking strategies', 'Professional branding']
    },
    {
      icon: <FaRocket className="text-2xl" />,
      title: 'Business',
      description: 'Build entrepreneurial skills and business acumen for success',
      benefits: ['Business fundamentals', 'Entrepreneurship', 'Financial literacy', 'Market understanding']
    },
    {
      icon: <FaHandshake className="text-2xl" />,
      title: 'Community',
      description: 'Connect with like-minded individuals for mutual growth and support',
      benefits: ['Peer networking', 'Mentorship opportunities', 'Collaborative projects', 'Support system']
    }
  ];

  const programFeatures = [
    {
      icon: <FaBook className="text-2xl" />,
      title: 'Learning Modules',
      description: 'Structured courses and workshops for systematic growth'
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: 'Mentorship',
      description: 'Guidance from experienced professionals and industry experts'
    },
    {
      icon: <FaCalendarAlt className="text-2xl" />,
      title: 'Community Events',
      description: 'Regular meetups, workshops, and networking opportunities'
    },
    {
      icon: <FaBullseye className="text-2xl" />,
      title: 'Progress Tracking',
      description: 'Tools to monitor and celebrate your development journey'
    }
  ];

  const growthSegments = [
    { label: 'Lifestyle', icon: <FaLeaf /> },
    { label: 'Leadership', icon: <FaCrown /> },
    { label: 'Creativity', icon: <FaPalette /> },
    { label: 'Career', icon: <FaBriefcase /> },
    { label: 'Business', icon: <FaRocket /> },
    { label: 'Community', icon: <FaUsers /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* UNIQUE HERO DESIGN - Radial Growth Wheel */}
      <section className="h-screen relative overflow-hidden bg-gradient-to-br from-[#193564] via-[#1a3c70] to-[#193564] px-4 sm:px-6 lg:px-8">
        {/* Animated Floating Fruits */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingFruits.map((fruit) => (
            <div
              key={fruit.id}
              className="absolute animate-float"
              style={{
                left: `${fruit.left}%`,
                top: `${fruit.top}%`,
                fontSize: `${fruit.size}px`,
                animationDuration: `${fruit.duration}s`,
                animationDelay: `${fruit.delay}s`
              }}
            >
              {fruit.emoji}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative h-full max-w-7xl mx-auto">
          <div className="h-full flex flex-col lg:flex-row items-center justify-between gap-8 py-8">
            {/* Left Content Column */}
            <div className="lg:w-1/2 space-y-6 md:space-y-4">
              {/* Logo and Badge Stack */}
              <div className="space-y-4">
                <img 
                  src="/10copy.png" 
                  alt="theFruiit" 
                  className="h-12 w-auto mt-20"
                />
                <div className="inline-flex items-center gap-2 bg-[#7EF949]/20 backdrop-blur-sm border border-[#7EF949]/40 rounded-full px-4 py-2 pl-2">
                  <div className="w-2 h-2 bg-[#7EF949] rounded-full animate-pulse"></div>
                  <span className="text-[#7EF949] font-semibold text-xs uppercase tracking-widest">
                    A Lovoh Create Initiative
                  </span>
                  <FaSeedling className="text-[#7EF949] ml-1" />
                </div>
              </div>

              {/* Main Headline with Typography Play */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#FFFCFF] leading-tight">
                  <span className="text-[#7EF949]">Grow</span>
                  <br />
                  <span className="relative">
                    Like a Fruit Tree
                    <div className="absolute -bottom-2 left-0 w-48 h-1 bg-gradient-to-r from-[#7EF949] to-transparent"></div>
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-[#FFFCFF]/90 leading-relaxed">
                  A vibrant growth community empowering young minds for 360° development.
                  <br />
                  <span className="italic">From seed to harvest—your journey to excellence.</span>
                </p>
              </div>

              {/* Growth Segments Selection */}
              <div className="space-y-3">
                <p className="text-[#7EF949] text-sm font-semibold">YOUR GROWTH AREAS:</p>
                <div className="grid grid-cols-3 gap-2">
                  {growthSegments.map((segment, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSegment(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        activeSegment === index 
                          ? 'bg-[#7EF949] text-[#193564]' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {segment.icon}
                      <span className="text-xs font-medium">{segment.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Buttons with Unique Layout */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button className="group relative bg-gradient-to-r from-[#7EF949] to-[#9aff6e] hover:from-[#9aff6e] hover:to-[#7EF949] text-[#193564] px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <FaSeedling /> Join the Community
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
                
                <button className="group bg-transparent hover:bg-white/10 border-2 border-white/30 hover:border-[#7EF949] text-white hover:text-[#7EF949] px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                  <FaPlay /> Watch Introduction
                </button>
              </div>

              {/* Community Stats in Cards */}
              {/* <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <div className="text-xl font-bold text-[#7EF949]">1K+</div>
                  <div className="text-white/80 text-xs">Growing Members</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                  <div className="text-xl font-bold text-[#7EF949]">50+</div>
                  <div className="text-white/80 text-xs">Expert Mentors</div>
                </div>
              </div> */}
            </div>

            {/* Right Column - Radial Growth Wheel */}
            <div className="lg:w-1/2 relative h-96 lg:h-full flex items-center justify-center">
              {/* Growth Wheel Container */}
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-[#7EF949]/20 rounded-full animate-spin-slow"></div>
                
                {/* Middle Ring */}
                <div className="absolute inset-12 border-3 border-[#7EF949]/40 rounded-full animate-spin-medium"></div>
                
                {/* Inner Ring */}
                <div className="absolute inset-24 border-2 border-[#7EF949]/60 rounded-full animate-spin-fast"></div>
                
                {/* Growth Segments */}
                {growthSegments.map((segment, index) => {
                  const angle = (index * 60) * (Math.PI / 180);
                  const radius = 140;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveSegment(index)}
                      className={`absolute w-16 h-16 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                        activeSegment === index
                          ? 'bg-gradient-to-br from-[#7EF949] to-[#9aff6e] scale-110 shadow-lg'
                          : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                      }`}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`
                      }}
                    >
                      <div className={`text-lg ${activeSegment === index ? 'text-[#193564]' : 'text-white'}`}>
                        {segment.icon}
                      </div>
                    </button>
                  );
                })}
                
                {/* Center Circle */}
                <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-[#193564] to-[#1a3c70] rounded-full flex items-center justify-center shadow-xl border-2 border-[#7EF949]">
                  <div className="text-center">
                    <div className="text-white text-xs">FOCUS ON</div>
                    <div className="text-[#7EF949] font-bold text-sm">
                      {growthSegments[activeSegment]?.label}
                    </div>
                  </div>
                </div>
                
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {growthSegments.map((_, index) => {
                    const angle = (index * 60) * (Math.PI / 180);
                    const radius = 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <line
                        key={index}
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${x}px)`}
                        y2={`calc(50% + ${y}px)`}
                        stroke={activeSegment === index ? "#7EF949" : "rgba(126, 249, 73, 0.2)"}
                        strokeWidth="1"
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              <span className="text-[#7EF949] text-sm mb-2 animate-pulse">Discover Growth</span>
              <div className="relative">
                <div className="w-6 h-10 rounded-full border-2 border-[#7EF949]/50 flex justify-center">
                  <div className="w-1.5 h-1.5 bg-[#7EF949] rounded-full absolute top-2 animate-bounce"></div>
                </div>
                <div className="absolute -inset-2 border border-[#7EF949]/20 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Areas Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <FaTree className="text-[#7EF949]" />
              <h2 className="text-3xl lg:text-4xl font-bold text-[#193564]">
                360° Personal
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7EF949] to-[#193564]">
                  Development
                </span>
              </h2>
              <FaTree className="text-[#7EF949]" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive growth across all aspects of life to help you become 
              the best version of yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developmentAreas.map((area, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                {/* Fruit Emoji Decoration */}
                <div className="absolute top-4 right-4 text-2xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {['🍎', '🍊', '🍋', '🍇', '🍓', '🍉'][index]}
                </div>
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    index === activeSegment 
                      ? 'bg-gradient-to-r from-[#7EF949] to-[#9aff6e] text-[#193564]' 
                      : 'bg-[#193564] text-white'
                  } transition-colors duration-300`}>
                    {area.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#193564] transition-colors">
                      {area.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {area.description}
                    </p>
                    
                    <div className="space-y-1">
                      {area.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#7EF949] rounded-full"></div>
                          <span className="text-gray-700 text-xs">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-[#193564] to-[#1a3c70] hover:from-[#7EF949] hover:to-[#9aff6e] text-white hover:text-[#193564] py-2 rounded-lg font-medium text-sm transition-all duration-300">
                  Explore {area.title} <FaChevronRight className="inline ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of your existing sections... */}
      {/* Program Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#193564] mb-4">
              How TheFruiit
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7EF949] to-[#193564]">
                Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive ecosystem designed to support your growth journey every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programFeatures.map((feature, index) => (
              <div 
                key={index}
                className="group text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-12 h-12 bg-[#7EF949] rounded-xl flex items-center justify-center text-[#193564] mb-4 mx-auto group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#193564] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#193564]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#FFFCFF] mb-6">
            Ready to Start Your Growth Journey?
          </h2>
          <p className="text-lg text-[#FFFCFF]/90 mb-8 max-w-2xl mx-auto">
            Join a community of ambitious young people committed to everyday advancement 
            and 360° personal development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#7EF949] hover:bg-[#9aff6e] text-[#193564] px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Become a Member
            </button>
            <button className="border-2 border-[#FFFCFF] text-[#FFFCFF] hover:bg-[#FFFCFF] hover:text-[#193564] px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105">
              Attend an Event
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheFruiitScreen;