import React from 'react'
import { Link } from 'react-router-dom'

const Win = () => {

   const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative z-20 min-h-screen bg-gradient-to-br from-[#054889] via-[#004aff] to-[#3c3c4e] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
          Win The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebed47] to-[#79ffff]">Game</span>
        </h1>
        
        {/* Description */}
        <div className="space-y-6 mb-12 max-w-3xl mx-auto">
          <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
            In today's fierce competition and ever-evolving business landscape, to be ahead in the game, <span className='t'
            style={{color: '#EBECF0', fontWeight: 'bold', fontStyle: 'italic'}}
            >your vision needs a team that works.</span>
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#37acf7] to-[#79ffff]">
            We are your Brand-Aid Partner.
          </p>
        </div>

        {/* CTA Button */} 
        <button 
          onClick={() => scrollToSection("services")}
          className="inline-block bg-gradient-to-r from-[#ebed47] to-[#79ffff] hover:from-[#f0f269] hover:to-[#8fffff] text-[#3c3c4e] font-bold text-lg px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Learn About Us
        </button>

        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#2f7dcb]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#004aff]/20 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-[#79ffff]/20 rounded-full blur-xl animate-pulse animation-delay-4000"></div>
      </div>
    </div>
  )
}

export default Win