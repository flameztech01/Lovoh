import React from 'react';

const Hero2 = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative z-20 min-h-screen bg-gradient-to-br from-[#37acf7]/20 to-[#79ffff]/20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3c3c4e] leading-tight">
                Ideas that{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aff] to-[#2f7dcb]">
                  Work
                </span>{' '}
                are{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2f7dcb] to-[#004aff]">
                  Worked.
                </span>
              </h1>
              
              <p className="text-xl text-[#3c3c4e] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Transforming visionary concepts into tangible solutions through 
                dedicated execution and strategic implementation.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-[#004aff] hover:bg-[#054889] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => scrollToSection("contact")} >
                Start Your Project
              </button>
              <button 
              onClick={() => scrollToSection("ourWork")} 
              className="cursor-pointer border-2 border-[#3c3c4e]/30 hover:border-[#004aff] text-[#3c3c4e] hover:text-[#004aff] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                View Our Work
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#004aff]">150+</div>
                <div className="text-[#3c3c4e] text-sm">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2f7dcb]">98%</div>
                <div className="text-[#3c3c4e] text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#054889]">5+</div>
                <div className="text-[#3c3c4e] text-sm">Years Experience</div>
              </div>
            </div>
          </div>

          {/* Illustrations Section */}
          <div className="relative">
            {/* Main Brain Illustration */}
            <div className="relative mx-auto w-80 h-80 lg:w-96 lg:h-96">
              {/* Brain Container */}
              <div className="absolute inset-0 bg-white rounded-full shadow-2xl flex items-center justify-center">
                {/* Brain Outline */}
                <div className="relative w-64 h-56">
                  {/* Left Hemisphere */}
                  <div className="absolute left-0 top-0 w-32 h-56 bg-gradient-to-br from-[#37acf7]/20 to-[#2f7dcb]/30 rounded-l-full rounded-r-3xl border-2 border-[#37acf7]/30"></div>
                  
                  {/* Right Hemisphere */}
                  <div className="absolute right-0 top-0 w-32 h-56 bg-gradient-to-br from-[#79ffff]/20 to-[#004aff]/30 rounded-r-full rounded-l-3xl border-2 border-[#79ffff]/30"></div>
                  
                  {/* Corpus Callosum */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-4 w-6 h-48 bg-gradient-to-b from-[#37acf7] to-[#004aff] rounded-full"></div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#ebed47]/20 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-[#ebed47] rounded-full flex items-center justify-center">
                  <span className="text-[#3c3c4e] font-bold text-sm">💡</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#79ffff]/30 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-10 h-10 bg-[#79ffff] rounded-full flex items-center justify-center">
                  <span className="text-[#3c3c4e] font-bold text-sm">⚡</span>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-[#004aff]/20 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-[#004aff] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero2;