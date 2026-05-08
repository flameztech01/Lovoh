import React, { useEffect, useRef } from 'react';
import { FiZap, FiCpu, FiTarget, FiTrendingUp, FiStar, FiAward } from 'react-icons/fi';
import { MdLightbulb, MdRocketLaunch, MdAutoAwesome } from 'react-icons/md';
import { BsLightningCharge, BsGraphUp } from 'react-icons/bs';
import { GiBrain } from 'react-icons/gi'; // Alternative brain icons

const Hero2 = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const brainRef = useRef(null);
  const floatingIconsRef = useRef([]);

  useEffect(() => {
    // Animate the brain pulsing
    const brain = brainRef.current;
    if (brain) {
      brain.style.animation = 'brainPulse 4s ease-in-out infinite';
    }

    // Animate floating icons
    floatingIconsRef.current.forEach((icon, index) => {
      if (icon) {
        icon.style.animation = `floatIcon ${6 + index * 2}s ease-in-out infinite`;
        icon.style.animationDelay = `${index * 0.5}s`;
      }
    });
  }, []);

  return (
    <section className="relative z-20 min-h-screen bg-gradient-to-br from-[#f0f7ff] to-[#e6fcfc] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Animated Background Patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#37acf7]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#79ffff]/5 rounded-full blur-3xl animate-pulse-slower"></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3c3c4e 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-lg border border-white/60">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#37acf7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#004aff]"></span>
                </span>
                <span className="text-sm font-semibold text-[#3c3c4e]">INNOVATION DRIVEN</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3c3c4e] leading-tight">
                Ideas that{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aff] to-[#2f7dcb]">
                    Work
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#004aff] to-[#2f7dcb] rounded-full"></span>
                </span>{' '}
                are{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2f7dcb] to-[#004aff]">
                    Worked.
                  </span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-[#2f7dcb] to-[#004aff] rounded-full"></span>
                </span>
              </h1>
              
              <p className="text-xl text-[#3c3c4e]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transforming visionary concepts into tangible solutions through 
                dedicated execution and strategic implementation.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="group relative bg-[#004aff] hover:bg-[#054889] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
                onClick={() => scrollToSection("contact")}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Your Project
                  <MdRocketLaunch className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#2f7dcb] to-[#004aff] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </button>
              
              <button 
                onClick={() => scrollToSection("ourWork")} 
                className="group cursor-pointer border-2 border-[#3c3c4e]/30 hover:border-[#004aff] text-[#3c3c4e] hover:text-[#004aff] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                View Our Work
                <BsGraphUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto lg:mx-0">
              {[
                { value: "150+", label: "Projects Completed", icon: FiAward, color: "from-[#004aff] to-[#2f7dcb]" },
                { value: "98%", label: "Success Rate", icon: FiTarget, color: "from-[#2f7dcb] to-[#37acf7]" },
                { value: "5+", label: "Years Experience", icon: FiStar, color: "from-[#37acf7] to-[#004aff]" }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} p-[2px]`}>
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <stat.icon className="w-5 h-5 text-[#3c3c4e]" />
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#004aff]">{stat.value}</div>
                  <div className="text-[#3c3c4e] text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustrations Section */}
          <div className="relative">
            {/* Main Brain Illustration */}
            <div ref={brainRef} className="relative mx-auto w-80 h-80 lg:w-96 lg:h-96">
              {/* Brain Container with Animation */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center border border-white/50">
                {/* Animated Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-[#37acf7]/20 animate-ping-slow"></div>
                <div className="absolute inset-4 rounded-full border-2 border-[#79ffff]/30 animate-pulse"></div>
                
                {/* Brain Outline */}
                <div className="relative w-64 h-56">
                  {/* Left Hemisphere with Animation */}
                  <div className="absolute left-0 top-0 w-32 h-56 bg-gradient-to-br from-[#37acf7]/20 to-[#2f7dcb]/30 rounded-l-full rounded-r-3xl border-2 border-[#37acf7]/30 animate-float-slow"
                    style={{ animationDelay: '0.2s' }}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <GiBrain className="w-16 h-16 text-[#004aff]" />
                    </div>
                  </div>
                  
                  {/* Right Hemisphere with Animation */}
                  <div className="absolute right-0 top-0 w-32 h-56 bg-gradient-to-br from-[#79ffff]/20 to-[#004aff]/30 rounded-r-full rounded-l-3xl border-2 border-[#79ffff]/30 animate-float-slow"
                    style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <GiBrain className="w-16 h-16 text-[#2f7dcb]" />
                    </div>
                  </div>
                  
                  {/* Corpus Callosum with Pulse */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-4 w-6 h-48 bg-gradient-to-b from-[#37acf7] to-[#004aff] rounded-full animate-pulse-slow"></div>
                  
                  {/* Neural Connections */}
                  {[...Array(6)].map((_, i) => (
                    <div key={i}
                      className="absolute w-1 h-1 bg-[#37acf7] rounded-full animate-ping"
                      style={{
                        left: `${30 + Math.random() * 40}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.3}s`,
                        opacity: 0.6
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Elements with Icons */}
              <div ref={el => floatingIconsRef.current[0] = el} 
                className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#ebed47] to-[#79ffff] rounded-2xl flex items-center justify-center shadow-xl transform rotate-12 hover:rotate-0 transition-all duration-500 group">
                <div className="w-16 h-16 bg-white/90 rounded-xl flex items-center justify-center">
                  <MdLightbulb className="w-8 h-8 text-[#004aff] group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div ref={el => floatingIconsRef.current[1] = el} 
                className="absolute -bottom-4 -left-8 w-16 h-16 bg-gradient-to-br from-[#79ffff] to-[#37acf7] rounded-full flex items-center justify-center shadow-xl transform -rotate-6 hover:rotate-0 transition-all duration-500 group">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <BsLightningCharge className="w-6 h-6 text-[#2f7dcb] group-hover:scale-125 transition-transform" />
                </div>
              </div>

              <div ref={el => floatingIconsRef.current[2] = el} 
                className="absolute top-1/3 -right-10 w-14 h-14 bg-gradient-to-br from-[#004aff] to-[#2f7dcb] rounded-lg flex items-center justify-center shadow-xl transform rotate-12 hover:rotate-0 transition-all duration-500 group">
                <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                  <MdRocketLaunch className="w-5 h-5 text-[#004aff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <div ref={el => floatingIconsRef.current[3] = el} 
                className="absolute bottom-1/3 -left-6 w-12 h-12 bg-gradient-to-br from-[#37acf7] to-[#79ffff] rounded-full flex items-center justify-center shadow-xl group">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-[#004aff] group-hover:animate-pulse" />
                </div>
              </div>

              {/* Orbiting Elements */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#ebed47] to-[#79ffff] rounded-full flex items-center justify-center shadow-xl">
                  <MdAutoAwesome className="w-4 h-4 text-[#3c3c4e]" />
                </div>
              </div>

              <div className="absolute inset-0 animate-spin-slower">
                <div className="absolute bottom-0 right-1/4 transform translate-y-1/2 w-6 h-6 bg-gradient-to-r from-[#004aff] to-[#2f7dcb] rounded-full flex items-center justify-center shadow-xl">
                  <FiCpu className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#37acf7" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#79ffff" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <circle cx="50%" cy="50%" r="120" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="4 4" className="animate-spin-slow" />
              <circle cx="50%" cy="50%" r="160" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="8 8" className="animate-spin-slower" />
            </svg>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes brainPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slower {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes ping-slow {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        
        .animate-brainPulse {
          animation: brainPulse 4s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatIcon 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 5s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slower {
          animation: spin-slower 25s linear infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero2;