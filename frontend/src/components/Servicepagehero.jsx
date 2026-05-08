// components/services/ServicesHero.jsx
import React from "react";
import { Link } from "react-router-dom";

const Servicepagehero = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-[#f7f8f4]">
      {/* Full screen hero - no curved edges, edge to edge */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background image */}
        <img
          src="/firstProject.png"
          alt="Services hero"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#254899]/45 via-black/20 to-black/55" />

        {/* Decorative line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ebed17] via-[#254899] to-[#ebed17]/70" />

        {/* Main Content */}
        <div className="relative z-10 flex items-center h-full px-5 sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <div className="mb-6">
              <span className="text-white/70 text-xs sm:text-sm uppercase tracking-[0.28em] font-semibold">
                Lovoh Create Services
              </span>
            </div>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
              Transform Your
              <span className="block text-[#ebed17]">Digital Presence</span>
            </h1>

            <div className="mt-6 max-w-3xl">
              <p className="text-base sm:text-lg lg:text-xl text-white/85 leading-8">
                End-to-end brand marketing and technology solutions designed
                to elevate your business, engage your audience, and drive
                measurable growth.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => scrollToSection("services")}
                className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-6 sm:px-7 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Explore Services
              </button>

              <Link
                to="/start-project"
                className="border border-white/35 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[#254899] px-6 sm:px-7 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>

        {/* Bottom floating info bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-white/10 backdrop-blur-md border-t border-white/15 px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-sm sm:text-base">
                Comprehensive Solutions
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">
                Brand marketing and technology solutions built for modern business growth.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Branding", "Strategy", "Design", "Web", "Marketing"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/85 text-xs sm:text-sm"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Servicepagehero;