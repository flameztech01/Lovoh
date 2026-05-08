import React from "react";
import { Link } from "react-router-dom";

const Experience = () => {
  const experiences = [
    { text: "Building and Construction" },
    { text: "Tech, Media, E-Commerce" },
    { text: "Food, Fashion, Beauty, Lifestyle" },
    { text: "Hospitality, Travels, Logistics" },
    { text: "Churches, Social Services, Coaching, NGOs" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#f8fafc] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#254899]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#254899]/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header - Centered */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#254899]/10 bg-white px-4 py-2 mb-5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#2f5bff] to-[#1e3a8a]" />
            <span className="text-sm font-semibold bg-gradient-to-r from-[#2f5bff] to-[#1e3a8a] bg-clip-text text-transparent">
              Industries Experience
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#111827]">
            <span>Industries</span>{" "}
            <span className="bg-gradient-to-r from-[#2f5bff] to-[#1e3a8a] bg-clip-text text-transparent">
              Xperience
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            It's 6 years of impacting brands across diverse industries. In our
            time, we've gained practical experience creating and executing ideas
            and solutions for both personal and corporate brands across various
            sectors.
          </p>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Left summary */}
          <div className="lg:col-span-4">
            <div className="h-full rounded-3xl bg-gradient-to-br from-[#2f5bff] via-[#2a4fd7] to-[#1e3a8a] p-8 text-white shadow-[0_18px_45px_rgba(37,72,153,0.25)] relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-lg font-bold mb-6">
                  50+
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold leading-snug">
                  We've helped over 50 SMEs grow with strategy, creativity, and
                  execution.
                </h3>

                <p className="mt-5 text-white/80 leading-7 text-sm sm:text-base">
                  Our work spans branding, digital products, campaigns, and
                  communication systems designed to move businesses forward.
                </p>
              </div>
            </div>
          </div>

          {/* Right cards */}
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-5">
              {experiences.map((experience, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-[#254899]/10 bg-white p-6 shadow-[0_12px_30px_rgba(37,72,153,0.08)] hover:shadow-[0_18px_40px_rgba(37,72,153,0.12)] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2f5bff] to-[#1e3a8a] text-white flex items-center justify-center font-bold shadow-md">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold leading-snug text-[#111827]">
                        {experience.text}
                      </h3>
                      <div className="mt-4 h-px w-full bg-[#254899]/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-[#254899]/10 bg-white px-6 sm:px-8 py-6 shadow-[0_12px_30px_rgba(37,72,153,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
                It's Your{" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                  Turn
                </span>
              </h2>
              <p className="mt-2 text-gray-600 leading-7 max-w-2xl">
                What does your brand need right now?
              </p>
            </div>

            <Link
              to="/start-project"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:opacity-90 text-white px-6 py-4 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Talk to us
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
