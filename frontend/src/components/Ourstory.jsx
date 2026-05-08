// components/about/OurStory.jsx
import React from "react";
import { FaLightbulb } from "react-icons/fa";

const Ourstory = () => {
  return (
    <section className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left content */}
          <div className="lg:col-span-7">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#254899]/70 mb-4">
                Our Story
              </p>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                <span className="text-[#111827]">From vision </span>
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">to reality</span>
              </h2>

              <div className="mt-8 space-y-6 text-gray-600 leading-8 text-base sm:text-lg">
                <p>
                  Lovoh Create was founded in 2020 with a clear objective: to bridge the gap between bold ideas and real market execution.
                </p>

                <p>
                  What began as a small team of creatives has evolved into a dynamic brand marketing & tech agency built on clarity, structure, and meaningful execution. From the outset, the focus has been simple: strong brands don't just need ideas, they need the right systems, positioning, and direction to succeed.
                </p>

                <p>
                  Today, Lovoh Create partners with businesses to translate vision into impact, through branding, marketing, and technology solutions designed for business growth.
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="lg:col-span-5">
            <div className="space-y-5">
              {/* Quote card - Updated with gradient like WhatWeDo */}
              <div className="relative rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(37,72,153,0.18)] overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
                
                <div className="absolute inset-0">
                  <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-ping" />
                  <div className="absolute bottom-10 right-10 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-6 border border-white/20">
                    <FaLightbulb className="text-[#ebed17] text-lg" />
                  </div>

                  <blockquote className="text-2xl sm:text-3xl font-bold leading-snug">
                    <span className="text-white">“Ideas that work </span>
                    <span className="bg-gradient-to-r from-[#ebed17] to-yellow-400 bg-clip-text text-transparent">are worked.”</span>
                  </blockquote>

                  <p className="mt-5 text-blue-100 leading-7">
                    This founding principle continues to shape how we think,
                    create, and deliver for every brand we support.
                  </p>
                </div>
              </div>

              {/* Milestone cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-[#254899]/10 bg-[#f8fafc] p-6 shadow-sm">
                  <div className="text-3xl font-bold text-[#254899]">2020</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.14em] text-gray-500">
                    Founded
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#254899]/10 bg-[#f8fafc] p-6 shadow-sm">
                  <div className="text-3xl font-bold text-[#254899]">150+</div>
                  <div className="mt-2 text-sm uppercase tracking-[0.14em] text-gray-500">
                    Projects Delivered
                  </div>
                </div>
              </div>

              {/* Bottom support text */}
              <div className="rounded-[1.5rem] border border-[#254899]/10 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#254899]/70 mb-3">
                  What drives us
                </p>
                <p className="text-gray-600 leading-7">
                  We combine strategy, creativity, and technology to help brands
                  grow with purpose, clarity, and confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ourstory;