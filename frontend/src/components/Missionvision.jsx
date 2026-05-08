// components/about/MissionVision.jsx
import React from "react";
import { FaBullseye, FaBinoculars } from "react-icons/fa";

const Missionvision = () => {
  return (
    <section className="relative bg-[#f8fafc] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* soft background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-0 w-72 h-72 bg-[#254899]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#254899]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section intro - CENTRALIZED */}
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#254899]/70 mb-4">
            What guides us
          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="text-[#111827]">Built on </span>
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">clarity and direction</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-8 max-w-2xl mx-auto">
            Everything we build is shaped by a clear vision, a strong mission,
            and a practical approach to helping brands grow with purpose.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-7 items-stretch">
          {/* Vision - large featured block */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-8 sm:p-10 lg:p-12 shadow-[0_24px_60px_rgba(37,72,153,0.18)]">
              <div className="flex items-center justify-between gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white/12 border border-white/10 flex items-center justify-center">
                  <FaBinoculars className="text-[#ebed17] text-xl" />
                </div>

                <span className="text-sm uppercase tracking-[0.18em] text-white/60">
                  Our Vision
                </span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-bold leading-tight max-w-2xl">
                To be the trusted brand partner for businesses winning today, and shaping the future of their industries.
              </h3>

              <div className="mt-8 max-w-2xl space-y-5 text-white/80 leading-8">
                <p>
                  We believe strong ideas should be matched with the right strategy, creativity, and technology to work in today's market.
                </p>

                <p>
                  This shapes how we approach every project. We focus on what moves the needle now, while building brands that can adapt, scale, and stay relevant as things evolve.
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 border border-white/10 px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-[#ebed17]" />
                  <span className="text-sm font-medium text-white/90">
                    Winning today, shaping tomorrow
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side stack */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Mission */}
            <div className="rounded-[2rem] bg-white border border-[#254899]/10 p-8 sm:p-9 shadow-[0_16px_40px_rgba(37,72,153,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#f6f8ff] border border-[#254899]/10 flex items-center justify-center">
                  <FaBullseye className="text-[#254899] text-xl" />
                </div>

                <span className="text-sm uppercase tracking-[0.18em] text-[#254899]/60">
                  Our Mission
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold leading-snug text-[#111827]">
                To empower forward-thinking businesses with marketing and technology solutions that drive measurable growth.
              </h3>

              <p className="mt-5 text-gray-600 leading-8">
                We combine strategy, creativity, and digital execution to solve real business challenges and drive measurable growth.
              </p>

              <p className="mt-4 text-gray-600 leading-8">
                We don't just make brands look good; we help them communicate clearly, perform better, and grow with confidence.
              </p>
            </div>

            {/* Focus strip - UPDATED */}
            <div className="rounded-[2rem] border border-[#254899]/10 bg-[#eef4ff] p-7 sm:p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#254899]/70 mb-4">
                Core Focus
              </p>

              <div className="flex flex-wrap gap-3 mb-5">
                <span className="px-4 py-2 rounded-full bg-white border border-[#254899]/10 text-[#254899] text-sm font-medium">
                  Brands
                </span>
                <span className="px-4 py-2 rounded-full bg-white border border-[#254899]/10 text-[#254899] text-sm font-medium">
                  People
                </span>
                <span className="px-4 py-2 rounded-full bg-white border border-[#254899]/10 text-[#254899] text-sm font-medium">
                  Technology
                </span>
              </div>

              <p className="text-gray-600 leading-7">
                We leverage technology to empower teams and build brands; this is the intersection where real business challenges meet practical solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Missionvision;