import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const Win = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!parallaxRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      parallaxRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative z-20 min-h-screen bg-[#faf9f6] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 30% 50%, rgba(5, 72, 137, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(0, 74, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 10% 20%, rgba(235, 237, 71, 0.03) 0%, transparent 50%),
          repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 12px)
        `,
      }}></div>

      {/* 3D Floating Cards Container */}
      <div ref={parallaxRef} className="absolute inset-0 transition-transform duration-200 ease-out">
        {/* Hero Image Mosaic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-6xl">
          <div className="grid grid-cols-3 gap-4 md:gap-6 opacity-30 rotate-12 scale-125">
            <div className="space-y-4">
              <div className="h-48 bg-gradient-to-br from-[#054889] to-[#004aff] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="/image1.jpg" alt="" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
              <div className="h-32 bg-gradient-to-br from-[#ebed47] to-[#79ffff] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="/image2.jpg" alt="" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="h-32 bg-gradient-to-br from-[#004aff] to-[#3c3c4e] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="/image2.jpg" alt="" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
              <div className="h-48 bg-gradient-to-br from-[#79ffff] to-[#ebed47] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="/image1.jpg" alt="" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-gradient-to-br from-[#054889] to-[#3c3c4e] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="/image1.jpg" alt="" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
              <div className="h-40 bg-gradient-to-br from-[#ebed47] to-[#004aff] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500 overflow-hidden">
                <img src="/image2.jpg" alt="" className="w-full h-full object-cover mix-blend-overlay" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-64 h-64 border-2 border-[#054889]/10 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-[#ebed47]/10 rounded-full animate-pulse-slower"></div>
        
        {/* Abstract Lines */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#054889" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#004aff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M0 200 L400 100 L800 300 L1200 150 L1600 400" stroke="url(#grad1)" strokeWidth="2" fill="none" />
          <path d="M200 600 L600 400 L1000 700 L1400 500 L1800 800" stroke="url(#grad1)" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Main Content - Glass Morphism Card */}
      <div className="relative z-30 max-w-5xl mx-auto">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50">
          
          {/* Animated Gradient Orb */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#ebed47] to-[#79ffff] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#054889] to-[#004aff] rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="relative z-40 text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 shadow-lg border border-white/60">
              <span className="w-2 h-2 bg-gradient-to-r from-[#ebed47] to-[#79ffff] rounded-full animate-ping"></span>
              <span className="text-sm font-semibold text-[#054889]">✨ BRAND INNOVATION</span>
            </div>

            {/* Main Heading with Split Animation */}
            <div className="overflow-hidden mb-6">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black">
                <span className="inline-block animate-slide-up">
                  <span className="text-[#054889]">Win</span>
                </span>
                <span className="inline-block animate-slide-up delay-100 ml-4">
                  <span className="text-[#004aff]">The</span>
                </span>
                <br />
                <span className="inline-block animate-slide-up delay-200">
                  <span className="bg-gradient-to-r from-[#ebed47] to-[#79ffff] bg-clip-text text-transparent">
                    Game
                  </span>
                </span>
              </h1>
            </div>
            
            {/* Description with Typing Effect */}
            <div className="space-y-6 mb-12 max-w-3xl mx-auto">
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed animate-fade-in">
                In today's fierce competition and ever-evolving business landscape, to be ahead in the game, <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#054889] to-[#004aff]">
                    your vision needs a team that works.
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-[#ebed47]/30 to-[#79ffff]/30 -z-10 blur-sm"></span>
                </span>
              </p>
              
              {/* Highlight Box */}
              <div className="relative inline-block px-8 py-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-xl">
                <p className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#004aff] to-[#3c3c4e]">
                  We are your Brand-Aid Partner.
                </p>
              </div>
            </div>

            {/* CTA Button with Glow Effect */}
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ebed47] to-[#79ffff] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <button 
                onClick={() => scrollToSection("services")}
                className="relative bg-gradient-to-r from-[#ebed47] to-[#79ffff] hover:from-[#f0f269] hover:to-[#8fffff] text-[#3c3c4e] font-bold text-lg px-10 py-5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Learn About Us
                <span className="ml-2">→</span>
              </button>
            </div>

            {/* Decorative Dots */}
            <div className="flex justify-center gap-2 mt-8">
              <span className="w-1 h-1 bg-[#054889]/30 rounded-full"></span>
              <span className="w-1 h-1 bg-[#004aff]/30 rounded-full"></span>
              <span className="w-1 h-1 bg-[#ebed47]/30 rounded-full"></span>
              <span className="w-1 h-1 bg-[#79ffff]/30 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.05); opacity: 0.15; }
        }
        
        @keyframes pulse-slower {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.1); opacity: 0.1; }
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}

export default Win