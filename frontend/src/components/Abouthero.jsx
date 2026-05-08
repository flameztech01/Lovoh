// components/about/AboutHero.jsx
import React from "react";

const Abouthero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/campus1.jpg"
          alt="Lovoh Create team"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Soft brand tint */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#254899]/35 via-black/25 to-black/55" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-5 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-4xl">
            <p className="text-white/70 text-xs sm:text-sm lg:text-base tracking-[0.15em] sm:tracking-[0.18em] uppercase mb-4 sm:mb-5 font-medium">
              Strategy. Creativity. Execution.
            </p>

            <h1 className="text-white text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] sm:leading-[1.08] lg:leading-[1.02]">
              We build brands
              <span className="block text-[#ebed17] mt-2 sm:mt-1">that move people</span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-2xl text-white/80 text-sm sm:text-base lg:text-xl leading-relaxed sm:leading-8">
              Lovoh Create is a Brand Marketing and Tech Agency helping
              forward-thinking businesses turn vision into meaningful brand
              experiences, digital solutions, and measurable growth.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom info strip - now properly positioned */}
      <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-0 right-0 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 lg:grid-cols-4 rounded-xl sm:rounded-2xl lg:rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md">
            <div className="px-2 sm:px-5 lg:px-7 py-2 sm:py-4 lg:py-5 border-r border-white/10 text-center sm:text-left">
              <div className="text-base sm:text-2xl lg:text-3xl font-bold text-white">150+</div>
              <div className="text-white/60 sm:text-white/65 text-[8px] sm:text-xs lg:text-sm uppercase tracking-[0.08em] sm:tracking-[0.14em] mt-0.5 sm:mt-1">
                Projects
              </div>
            </div>

            <div className="px-2 sm:px-5 lg:px-7 py-2 sm:py-4 lg:py-5 border-r border-white/10 text-center sm:text-left">
              <div className="text-base sm:text-2xl lg:text-3xl font-bold text-white">6+</div>
              <div className="text-white/60 sm:text-white/65 text-[8px] sm:text-xs lg:text-sm uppercase tracking-[0.08em] sm:tracking-[0.14em] mt-0.5 sm:mt-1">
                Years
              </div>
            </div>

            <div className="px-2 sm:px-5 lg:px-7 py-2 sm:py-4 lg:py-5 text-center sm:text-left">
              <div className="text-base sm:text-2xl lg:text-3xl font-bold text-[#ebed17]">50+</div>
              <div className="text-white/60 sm:text-white/65 text-[8px] sm:text-xs lg:text-sm uppercase tracking-[0.08em] sm:tracking-[0.14em] mt-0.5 sm:mt-1">
                Brands
              </div>
            </div>

            {/* Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block px-7 py-5">
              <div className="text-3xl font-bold text-white">✓</div>
              <div className="text-white/65 text-sm uppercase tracking-[0.14em] mt-1">
                Trusted
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Abouthero;